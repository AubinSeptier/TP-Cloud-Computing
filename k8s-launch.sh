#!/bin/bash

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
REGISTRY_IP="192.168.56.101"
REGISTRY_PORT="5000"
BACKEND_IMAGE="${REGISTRY_IP}:${REGISTRY_PORT}/imc-tracker-backend:latest"
FRONTEND_IMAGE="${REGISTRY_IP}:${REGISTRY_PORT}/imc-tracker-frontend:latest"

# Fonction pour afficher les messages
print_step() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Fonction pour demander confirmation
ask_yes_no() {
    while true; do
        read -p "$1 (y/n): " yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Veuillez répondre par y ou n.";;
        esac
    done
}

# 1. Lancement du registre Docker local
print_step "Étape 1: Vérification/Lancement du registre Docker local"

if docker ps -a --format "table {{.Names}}" | grep -q "^registry$"; then
    if docker ps --format "table {{.Names}}" | grep -q "^registry$"; then
        print_success "Le registre Docker est déjà en cours d'exécution"
    else
        print_warning "Le registre existe mais n'est pas démarré. Démarrage..."
        docker start registry
        print_success "Registre Docker démarré"
    fi
else
    print_warning "Création et démarrage du registre Docker local..."
    if docker run -d -p ${REGISTRY_PORT}:5000 --restart=always --name registry registry:2; then
        print_success "Registre Docker créé et démarré sur le port ${REGISTRY_PORT}"
    else
        print_error "Échec de la création du registre Docker"
        exit 1
    fi
fi

# 2. Construction des images
print_step "Étape 2: Construction des images Docker"

BUILD_IMAGES=false

if ask_yes_no "Voulez-vous construire les images Docker ?"; then
    BUILD_IMAGES=true
    
    # Vérification de l'existence des dossiers
    if [[ ! -d "./backend" ]]; then
        print_error "Le dossier ./backend n'existe pas"
        exit 1
    fi
    
    if [[ ! -d "./frontend" ]]; then
        print_error "Le dossier ./frontend n'existe pas"
        exit 1
    fi
    
    print_warning "Construction de l'image backend..."
    if docker build -t ${BACKEND_IMAGE} ./backend; then
        print_success "Image backend construite avec succès"
    else
        print_error "Échec de la construction de l'image backend"
        exit 1
    fi
    
    print_warning "Construction de l'image frontend..."
    if docker build -t ${FRONTEND_IMAGE} ./frontend; then
        print_success "Image frontend construite avec succès"
    else
        print_error "Échec de la construction de l'image frontend"
        exit 1
    fi
else
    print_warning "Construction des images ignorée"
fi

# 3. Push des images
if $BUILD_IMAGES; then
    print_step "Étape 3: Push des images vers le registre local"
    
    print_warning "Push de l'image backend..."
    if docker push ${BACKEND_IMAGE}; then
        print_success "Image backend pushée avec succès"
    else
        print_error "Échec du push de l'image backend"
        exit 1
    fi
    
    print_warning "Push de l'image frontend..."
    if docker push ${FRONTEND_IMAGE}; then
        print_success "Image frontend pushée avec succès"
    else
        print_error "Échec du push de l'image frontend"
        exit 1
    fi
else
    print_step "Étape 3: Push des images ignoré (images non reconstruites)"
fi

# 4. Installation de K3s
print_step "Étape 4: Installation de K3s"

if ask_yes_no "Voulez-vous installer K3s ?"; then
    print_warning "Installation de K3s en cours..."
    if sudo curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--docker --disable traefik" sh -s - server --node-ip ${REGISTRY_IP}; then
        print_success "K3s installé avec succès"
        sleep 10  # Attendre que K3s soit complètement démarré
    else
        print_error "Échec de l'installation de K3s"
        exit 1
    fi
else
    print_warning "Installation de K3s ignorée"
fi

# 5. Affichage du token
print_step "Étape 5: Token du nœud K3s"

if [[ -f "/var/lib/rancher/k3s/server/node-token" ]]; then
    print_warning "Token du nœud K3s :"
    sudo cat /var/lib/rancher/k3s/server/node-token
    echo ""
    print_warning "Appuyez sur Entrée pour continuer..."
    read -r
else
    print_error "Le fichier de token K3s n'existe pas. K3s n'est peut-être pas installé."
    exit 1
fi

# 6. Vérification des nœuds
print_step "Étape 6: Vérification des nœuds K3s"

print_warning "Vérification de l'état des nœuds..."
if sudo k3s kubectl get nodes; then
    print_success "Nœuds K3s vérifiés avec succès"
else
    print_error "Échec de la vérification des nœuds K3s"
    exit 1
fi

# 7. Application des fichiers YAML
print_step "Étape 7: Déploiement des ressources Kubernetes"

# Vérification de l'existence des dossiers
declare -a required_dirs=("k8s/config" "k8s/db" "k8s/backend" "k8s/frontend" "k8s/ingress")
for dir in "${required_dirs[@]}"; do
    if [[ ! -d "$dir" ]]; then
        print_error "Le dossier $dir n'existe pas"
        exit 1
    fi
done

# Application des configurations
print_warning "Application des configurations..."
if sudo k3s kubectl apply -f k8s/config/; then
    print_success "Configurations appliquées"
    sleep 5
else
    print_error "Échec de l'application des configurations"
    exit 1
fi

# Application de la base de données
print_warning "Application des ressources de base de données..."
if sudo k3s kubectl apply -f k8s/db/; then
    print_success "Ressources de base de données appliquées"
    sleep 5
else
    print_error "Échec de l'application des ressources de base de données"
    exit 1
fi

# Job de migration
print_warning "Lancement du job de migration..."
if sudo k3s kubectl apply -f k8s/backend/migration-job.yaml; then
    print_success "Job de migration créé"
    
    print_warning "Attente de la completion du job de migration (timeout: 300s)..."
    if sudo k3s kubectl wait --for=condition=complete job/migration-job --timeout=300s; then
        print_success "Job de migration terminé avec succès"
        sleep 5
    else
        print_error "Le job de migration a échoué ou a expiré"
        exit 1
    fi
else
    print_error "Échec de la création du job de migration"
    exit 1
fi

# Application du backend
print_warning "Application des ressources backend..."
if sudo k3s kubectl apply -f k8s/backend/; then
    print_success "Ressources backend appliquées"
    sleep 5
else
    print_error "Échec de l'application des ressources backend"
    exit 1
fi

# Application du frontend
print_warning "Application des ressources frontend..."
if sudo k3s kubectl apply -f k8s/frontend/; then
    print_success "Ressources frontend appliquées"
    sleep 5
else
    print_error "Échec de l'application des ressources frontend"
    exit 1
fi

# Installation d'Ingress NGINX
print_warning "Installation d'Ingress NGINX..."
if sudo k3s kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml; then
    print_success "Ingress NGINX installé"
    
    print_warning "Attente du démarrage d'Ingress NGINX (timeout: 120s)..."
    if sudo k3s kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=120s; then
        print_success "Ingress NGINX prêt"
        sleep 5
    else
        print_error "Ingress NGINX n'a pas pu démarrer dans les temps"
        exit 1
    fi
else
    print_error "Échec de l'installation d'Ingress NGINX"
    exit 1
fi

# Application des règles d'ingress
print_warning "Application des règles d'ingress..."
if sudo k3s kubectl apply -f k8s/ingress/; then
    print_success "Règles d'ingress appliquées"
else
    print_error "Échec de l'application des règles d'ingress"
    exit 1
fi

print_step "Déploiement terminé avec succès !"
print_success "Votre application IMC Tracker est maintenant déployée sur K3s"
print_warning "Vous pouvez vérifier l'état des pods avec : sudo k3s kubectl get pods --all-namespaces"
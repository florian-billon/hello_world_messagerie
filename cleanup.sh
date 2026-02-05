#!/bin/bash
# Script de nettoyage automatique des fichiers Zone.Identifier
# Ces fichiers sont créés automatiquement par Windows

echo "🧹 Nettoyage des fichiers Zone.Identifier..."

# Supprimer tous les fichiers Zone.Identifier
find . -name "*.Zone.Identifier" -type f -delete

echo "✅ Nettoyage terminé !"
echo "💡 Astuce: Utilisez 'tree -I \"*.Zone.Identifier\"' pour masquer ces fichiers"


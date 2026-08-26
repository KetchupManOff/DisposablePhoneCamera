#!/bin/bash
# Mini serveur HTTP pour télécharger le certificat depuis l'iPhone
echo "=========================================="
echo "  Mini serveur de certificat"
echo "  Ouvre sur ton iPhone :"
echo "  http://192.168.0.18:8888"
echo "=========================================="
echo ""
echo "Une fois le cert téléchargé :"
echo "  1. Réglages → Profil téléchargé → Installer"
echo "  2. Réglages → Général → Infos → Confiance certificats → Activer"
echo ""

RESPONSE=$(cat <<EOF
HTTP/1.1 200 OK
Content-Type: application/x-x509-ca-cert
Content-Disposition: attachment; filename="dispoCam.crt"
Connection: close

$(cat certs/cert.pem)
EOF
)

while true; do
  echo "$RESPONSE" | nc -l 8888
done

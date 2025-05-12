# CCS WS24/25 - Assignment 1

## Domain & Region
- **Domain**: gruppe6.dxfrontiers-ccs.de
- **Hosted Zone ID**: Z04547462P4Z0ENCO2TWN
- **Region**: Frankfurt (eu-central-1)

## Netzwerk-Architektur
### VPC Konfiguration
- **CIDR**: 172.31.0.0/16
- **Availability Zones**: 2
- **NAT Gateways**: 1

### Subnets (alle /27)
1. **Public Subnet**
- Direkter Internet-Zugriff
- Für öffentliche Services

2. **Private Subnet**
- Internet-Zugriff via NAT
- Für interne Anwendungen

3. **Isolated Subnet**
- Kein Internet-Zugriff
- Für sensitive Ressourcen
- VPC Flow Logs aktiviert für REJECT-Traffic

## Sicherheit
### Zertifikat
- DNS-Validierung über Route53
- Wildcard-Support für Subdomains
- RSA 2048

### Secrets
- Name: demoapp-secrets
- Automatisch generierter Key (32 Zeichen)
- JSON-Format mit "secretKey"

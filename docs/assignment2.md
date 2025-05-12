# CCS WS24/25 - Assignment 2
## DB-Stack Architektur

### 1. Netzwerk-Integration

#### 1.1 Subnet-Platzierung
- **Subnetz**: Isolated Subnet (keine Internetkonnektivität)
- **Sicherheitsrichtlinie**: Höchstmögliche Isolation der Datenbank

#### 1.2 Verfügbarkeit
- **Verteilung**: Multi-AZ (Availability Zone) zur Verbesserung der Ausfallsicherheit
- **Failover**: Automatisches Failover bei Ausfällen

#### 1.3 Lifecycle Management
- **Datenbank**: PostgreSQL 16
- **Updates**: Automatische Major-Updates aktiviert für aktuelle Versionen

### 2. Sicherheitsarchitektur

#### 2.1 Datenbank-Sicherheit
- **Secrets Manager Integration**: Für den sicheren Zugriff auf Datenbank-Zugangsdaten
- **Security Group**: Export der Security Group ID zur Kommunikation mit anderen Stacks

#### 2.2 Security Group Design
- **Zugriffskontrolle**: Zentralisierte Security Group Verwaltung
- **Aktuelle Konfiguration**: `allowAllOutbound: true` (eventuell restriktivere Regeln erforderlich)


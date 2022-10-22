# Praxisprojekt 2022

## Erarbeitung eines Peer-to-Peer-Konzeptes zur Speicherung und Bereitstellung von Sensordaten mit prototypischer Implementierung
Im Rahmen des Praxisprojektes wurde ein alternativer Ansatz zu gängigen Internetof-
Things Architekturen untersucht und prototypisch implementiert. Der Peer-to-Peer
Ansatz hat das Potenzial, Systeme robuster und resistenter zu machen, in dem z.B.
single point of failure vermieden werden. (Lua u. a., 2005).
Das Praxisprojekt greift den Kontext und die Annahme des ECCO-Box-Systems auf
(Blähser, 2021). Ein erster Architekturentwurf des Systems wurde als Vorlage bereitgestellt
und ist im Anhang unter A.1 zu finden. Die ECCO-Boxen werden in der Edge
betrieben und sollen Sensordaten speichern, verarbeiten und bereitstellen können. Sie
sind Modular aufgebaut, wobei jedes Modul in einem eigenen Container deployed wird.
Eine ECCO-Box besteht aus folgenden Modulen: einem Peer-to-Peer Modul, welches in
diesem Projekt zentral behandelt werden soll, einem oder mehreren Consumer, einem
oder mehreren Producer und einem Processor.
Gängige Internet of Things (IoT) Kommunikationsarchitekturen nutzen für das versenden
von Nachrichten und zur Verarbeitung von Data Streams (z.B. Sensordaten)
i.d.R. entweder einen Broker-basierten Publish/Subscriber-Ansatz wie z.B. MQTT,
oder das Client/Server Model wie z.B. CoAP (Lombardi u. a., 2021). Die Nutzung
eines zentralen Brokers oder des Client/Server-Model führen zu einer zentralisierten
Architektur, was Nachteile mit sich bringt. So determiniert die Leistungsfähigkeit des
Brokers die Skalierbarkeit des Gesamtsystems. Wird eine gewisse Anzahl von Nodes
überschritten, muss ein weiterer Broker zugeschaltet werden. Dadurch wird die Skalierbarkeit
des Systems komplexer und ressourcenintensiver. Bei großen Datenmengen
kann es durch die Nutzung eines zentralen Brokers zu Leistungsengpässen kommen,
wodurch die Leistung des gesamten Systems beeinträchtigt wird (vgl. (Banno u. a.,
2021)). Fällt der Broker aus, kann dies zum erliegen des gesamten Systems führen.
Aus diesem Grund besteht bei einer Architektur, die zur Kommunikation einen zentralen
Broker verwendet die Gefahr eines single point of failure (SPOF). Um Systeme
resilienter zu machen sollten single point of failure und Leistungsengpässe vermieden
werden.
Aus genannter Problematik entsteht die Motivation ein System auf Basis einer Peerto-
Peer Technologie zu konzipieren. Bei Peer-to-Peer Overlay-Netzwerken handelt es
sich um verteilte Systeme ohne Hierarchie und, in vielen Fällen, ohne eine zentrale
Komponente. Diese Overlay Netzwerke nutzen i.d.R. den TCP/IP-Protokollstapel und
können eine vollständig dezentrale Architektur ermöglichen (Buford u. Yu, 2010).
Shen u. a. (2010) und Lua u. a. (2005) dienten zur Schaffung von Grundlagenwissen
über die Funktionsweise von Peer-to-Peer Netzwerken.
Das Praxisprojekt hat zum Ziel ein Peer-to-Peer-Konzept zur Speicherung und Bereitstellung
von Sensordaten zu erarbeiten. Der erarbeitete Lösungsansatz wird prototypisch
Implementiert. Anhand eines Proof-of-Concept (PoC) wird die Machbarkeit
des Ansatzes geprüft.

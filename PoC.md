zwei Pi's speichern Sensordaten fünf ++ lesen die Daten aus
Sensor-Server-Node-1
Sensor-Server-Node-2
Node-3 bis Node-6
Sensor-Node: Server
alle Node's: Clients
d.h. Sensor-Server-Node-1 liest schickt query an Sensor-Server-Node-2 und umgekehrt
		
Sensor-Server-Node-1 wird gestartet und schreibt Daten in die DB
Node-3 wird gestartet, queried die Daten von Sensor-Server-Node-1 und schreibt die Antwort in die Konsole
Sensor-Server-Node-2 wird gestartet, schreibt die eigenen Sensordaten in die DB und queried die Daten von Sensor-Server-Node-1 und schreibt diese in die Console
Node-3 reagiert (wie genau? via PubSub oder live Update??)  auf neue Daten von Sensor-Server-Node-2 queried diese und schreibt die res. in die Konsole
Node-4 bis Node-X werden gestartet, querien die Daten von Sensor-Server-Node-1 und Sensor-Server-Node-2 und schreiben diese in die Konsole
Sensor-Server-Node-1 schreibt neue Messungen in die DB
Alle Nodes werden über neue Daten Benachrichtigt (wie?) querien die neuen Daten und schreiben diese in die Konsole
…ggf. weitere schritte
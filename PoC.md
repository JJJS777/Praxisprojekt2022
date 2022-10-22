# Durchführung des Proof-of-Concept

1.  [x] ecco-box-1 wird gestartet. Diese Box schreibt alle t Sekunden die GPU Temperatur mit dem dazugehörigen Zeitstempel in die Hyperbee Datenbank.

2.  [x] help-box-3 wird gestartet. Diese Box repliziert den Hypercore von ecco-box-1, fragt die letzten drei Temperaturwarte ab und schreibt diese in die Konsole.

3.  [x] ecco-box-2 wird gestartet. Diese Box schreibt alle t Sekunden CPU Temperatur mit dem dazugehörigen Zeitstempel in die Hyperbee Datenbank. Zusätzlich repliziert auch diese Box den Hypercore von ecco-box-1, fragt die letzten drei Temperaturwarte ab und schreibt diese in die Konsole.

4.  [x] help-box-3 und ecco-box-1 werden benachrichtig, dass eine neue Box und das Netzwerk eingetreten ist.

5.  [ ] Anschließend repliziert help-box-3 und ecco-box-1 den Hypercore von ecco-box-2 und schreibt die Daten in die Konsole. -> ecco-1 schreibt keine Daten in die Konsole!!

6.  [x] help-box-4 bis help-box-8 werden nacheinander gestartet. Nach dem Start replizieren help-box-5, 7 und 8 die Daten, welche durch ecco-box-1 und ecco-box-2 bereitgestellt werden und schreiben diese in die Konsole. Help-box-4 und help-box-6 abonnieren sich auf jede Änderung im Datensatz von ecco-box-1, d.h. sie schreiben fortwährend die neuen messerwerte in die Konsole.

7.  [x] ecco-box-1 fällt aus. Zusätzlich fallen help-box-3, -5, -6, -7, -8 aus. Nur noch ecco-box-2 und help-box-4 sind aktuell online.

8.  [x] help-box-9 tritt in das Netzwerk ein. Trotzt des Ausfalls von ecco-box-1 kann help-box-9 auf die Daten bis zum Zeitpunkt des Ausfalls zugreifen.

9.  [x] ecco-box-1 wird neu gestartet und tritt dem Schwarm erneut bei. Die Boxen, die die live-option implementieren schreiben wieder die neuesten Messwerte in die Konsole.

# Checkliste PoC

- [x] Daten im Netzwerk verfügbar, auch wenn quelle offline
- [x] Live Update bzw. PubSub

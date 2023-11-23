![Logo](admin/energiefluss.png)

# ioBroker.energiefluss

## Funktionen
**Design:**
- Aendern Sie die Farbe jedes Elements
- Elemente koennen ausgewaehlt werden (Kreis oder Rechteck)
- Zeitintervall einstellbar, um wechselnde Anzeigen innerhalb der Elemente darzustellen
- Texte innerhalb der Elemente koennen geaendert werden (&lt;br&gt; gilt als Zeilenumbruch)
- %-Texte koennen auch andere Farben haben
- Definieren Sie verschiedene Farben fuer jede Linie
- Linien koennen ausgeblendet werden, wenn keine Animation auf der Linie stattfindet
- verschiedene Farben fuer jede Animation auf der Linie definieren
- Dicke der Elemente und Linien aenderbar
- Fuelle die Elemente mit verschiedenen Farben (Elemente mit Prozentwerten koennen auch prozentual gefuellt werden; wird keine Farbe gewaehlt, ist das Element transparent)
- Schatten der Elemente ein-/ausblenden
- Schatten fuer Werte, Beschreibungen und Icons koennen definiert werden
- Radius des Kreises anpassbar
- Hoehe, Breite und Eckenradius des Rechtecks anpassbar
- Definieren Sie Ihre eigene Farbe und Deckkraft fuer die Schatten (rgba-unterstuetzt)
- Schriftarten der Werte und Texte aendern (eigene Schriftarten koennen importiert werden)
- Texte, Werte, Icons, Prozentwerte und Batterietext neu ausrichten (hoeher oder tiefer)
- Aendern Sie die Schriftgroessee fuer Label, Werte und %-Texte
- Transparenz fuer Icon, Linie, Text, Wert, Prozent-Wert und verbleibenden Batterie Text moeglich
- Definieren Sie eine Farbe fuer das Autosymbol, wenn es geladen wird
- Einige Werte koennen unterschiedliche Farben haben, wenn ihr Wert unterhalb eines Schwellenwerts ist (Verbrauch, Produktion, Netz und Batterie)
- Batterie-Icon kann beim Laden und Entladen animiert werden
- Anzahl der animierten Punkte auf der Linie, sowie deren Abstand, Laenge, Dauer, Stil und Dicke auswaehlbar
- automatische Animationsgeschwindigkeit kann verwendet werden, um den hoechsten Verbrauch innerhalb der benutzerdefinierten Elemente 1 bis 11 einfach zu identifizieren
- Verbleibende Lade-/Entladezeit der Batterie anzeigen (ist abhaengig von Batterieprozent und Batteriekapazitaet)
- Slim-Design moeglich - Kleinerer Abstand zum Batterie Element

**Technisch:**
- Datenpunkte fuer jedes Element definieren (fuege einen zweiten Datenpunkt zu den Elementen Produktion, Zusatzproduktion, Verbrauch und Netz hinzu, um diesen z.B. als Tageszusammenfassung zu nutzen)
- 3 Produktions-Elemente darstellbar (wenn 3 aktiv sind, wird das Slim-Design deaktiviert)
- auch fuer Insel-Anlagen (Linie von der Produktion zum Netz kann deaktiviert werden)
- Batterieprozentsatz innerhalb des Auto- oder Batterie-Elements anzeigen
- unterschiedliche Zustaende fuer Einspeisung oder Bezug aus dem Netz verwenden
- Einstellungen umkehren, wenn Ihre Werte negativ sind (fuer Verbrauch, Netzeinspeisung, Laden-/Entladen der Batterie)
- Verwenden Sie positive oder negative Werte fuer den Verbrauch
- Berechnen Sie Ihren Verbrauch ueber Erzeugung und Netzeinspeisung, wenn Sie keinen Stromzaehler haben
- Verwenden Sie verschiedene Zustaende fuer Ihre Batterie
- Fuegen Sie 10 eigene Elemente als Verbraucher mit unterschiedlichem Text, Werten und Symbolen hinzu (2 Elemente koennen als weiterer Auto-Ladepunkt konfiguriert werden, 2 Elemente koennen als Balkonkraftwerk genutzt werden)
- Alle Werte von W in kW umrechnen
- Alle Werte koennen in W oder kW vorliegen. Der Adapter rechnet die Werte passend um
- Waehlen Sie, wie viele Dezimalstellen Sie anzeigen moechten (0, 1, 2) - fuer Werte und Akkuladung
- Waehlen Sie die Einheit (Freitext)
- Ziehen Sie den Verbrauch des Autos und der Zusatzgeraete vom Verbrauch im Haus ab (auswaehlbar)
- Alle Datenpunkte koennen ueber den Objekt-Browser ausgewaehlt werden
- Definieren Sie einen Schwellenwert, um nur Werte darueber anzuzeigen

## Implementierung
Anzeige ist ueber den Instanz Link moeglich. Dieser kann dann auch in ein iFrame oder HTML Widget eingefuegt werden.

## Benutzerdefinierte Elemente
![Beschreibung](doc/custom_elements.png)

## Symbole
Bitte ins Wiki schauen


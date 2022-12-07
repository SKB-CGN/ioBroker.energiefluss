![Logo](admin/energiefluss.png)

# ioBroker.energiefluss

[![NPM version](https://img.shields.io/npm/v/iobroker.energiefluss?style=flat-square)](https://www.npmjs.com/package/iobroker.energiefluss)
[![Downloads](https://img.shields.io/npm/dm/iobroker.energiefluss.svg)](https://www.npmjs.com/package/iobroker.energiefluss)
![Number of Installations](https://iobroker.live/badges/energiefluss-installed.svg)

![GitHub](https://img.shields.io/github/license/SKB-CGN/iobroker.energiefluss?style=flat-square)
![GitHub repo size](https://img.shields.io/github/repo-size/SKB-CGN/iobroker.energiefluss?logo=github&style=flat-square)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/SKB-CGN/iobroker.energiefluss?logo=github&style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/SKB-CGN/iobroker.energiefluss?logo=github&style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/SKB-CGN/iobroker.energiefluss?logo=github&style=flat-square)

[![NPM](https://nodei.co/npm/iobroker.energiefluss.png?downloads=true)](https://nodei.co/npm/iobroker.energiefluss/)

**Tests:** ![Test and Release](https://github.com/SKB-CGN/ioBroker.energiefluss/workflows/Test%20and%20Release/badge.svg)

## Energiefluss adapter for ioBroker
It provides an animated energyflow of the current consumption for photovoltaics, battery, house-consumption, grid-feed-in (grid-consumption), car charge and up to 4 possible elements (circle or rectangle).

## Energiefluss adapter fuer ioBroker
Es stellt einen animierten Energiefluss des aktuellen Verbrauchs fuer Photovoltaik, Batterie, Hausverbrauch, Einspeisung (Netzbezug), Auto-Ladung und bis zu 4 benutzerdefinierte Elemente (Kreis oder Rechteck) zur Verfuegung.

## Installation
Installation via Github Cat possible. To do this, go to custom and enter the Github address from here.

## Installation
Installation ueber die Github Katze in ioBroker moeglich. Hierzu auf benutzerdefiniert gehen und die Github Adresse von hier angeben.

## Support
If you like my work und you would like to support me, you can do so here:
[![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://www.paypal.me/StephanKreyenborg)

## Unterstuetzung
Wenn Dir meine Arbeit gefaellt und Du mich unterstuetzen moechtest, so kannst Du dies hier tun:
[![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://www.paypal.me/StephanKreyenborg)

## Functions (german below)
**Design:**
- change the color of each item
- Elements can be selected (circle or rectangle)
- Texts inside the elements can be modified (&lt;br&gt; works as line-break)
- %-texts can have different colors as well
- define different colors for each line
- define different colors for each animation on the line
- change thickness of the elments and lines
- fill the elements with different colors (elements with percent values can be filled according to their percent value; if no color is selected, the element is transparent)
- show/hide shadows of the elements
- change radius of the circles
- change width, height and corner rounds of the rectangle
- define your own color and opacity for the shadows (rgba supported)
- change fontfaces of the values and texts (own fonts can be imported)
- Realign texts, values, icons, percentages and battery text (higher or lower)
- change the font size for label, values and %-texts
- Transparency for icon, line, text, value, percent-value and remaining battery text possible
- define a color for the the car icon, if its charging
- Some Values can have different colors, if their value is below a threshold (consumption, production, grid and battery)
- Battery icon can be animated while charging or discharging
- number of animation dots, their distance between each other, length, duration, style and width selectable
- Display the remaining time of charging your battery (depends on percent and capacity)
- Slim-Design possible - reduces distance to battery element

**Technical:**
- define Datapoints for each element
- show battery percent inside car or battery element
- use different states for feeding into or consuming from the grid
- reverse settings if your values are negative (for consumption, feeding the grid, charging-/discharging the battery)
- use positive or negative values for consumption
- calculcate your consumption via production and grid-feed-in, if you do not have a powermeter
- use different states for your battery
- add 10 own elements for a consuming device with different text, values and icon (1 element can be configured as additional car-charge)
- convert all values from W into kW
- Choose, how many decimal places you want to display (0, 1, 2) - for values and battery charging
- choose the unit (freetext)
- Subtract the consumption of the car and additional equipment from the consumption in the house (selectable)
- All objects can be choosen via the object-browser
- define a threshold, to display only values above

## Implementation
Display is possible via the instance link. This can then also be inserted into an iFrame or HTML widget.

## Funktionen
**Design:**
- Aendern Sie die Farbe jedes Elements
- Elemente koennen ausgewaehlt werden (Kreis oder Rechteck)
- Texte innerhalb der Elemente koennen geaendert werden (&lt;br&gt; gilt als Zeilenumbruch)
- %-Texte koennen auch andere Farben haben
- Definieren Sie verschiedene Farben fuer jede Linie
- verschiedene Farben fuer jede Animation auf der Linie definieren
- Dicke der Elemente und Linien aenderbar
- Fuelle die Elemente mit verschiedenen Farben (Elemente mit Prozentwerten k�nnen auch prozentual gef�llt werden; wird keine Farbe gew�hlt, ist das Element transparent)
- Schatten des Elemente ein-/ausblenden
- Radius des Kreises anpassbar
- Hoehe, Breite und Eckenradius des Rechtecks anpassbar
- Definieren Sie Ihre eigene Farbe und Deckkraft fuer die Schatten (rgba-unterstuetzt)
- Schriftarten der Werte und Texte aendern (eigene Schriftarten koennen importiert werden)
- Texte, Werte, Icons, Prozentwerte und Batterietext neu ausrichten (h�her oder tiefer)
- Aendern Sie die Schriftgroessee fuer Label, Werte und %-Texte
- Transparenz fuer Icon, Linie, Text, Wert, Prozent-Wert und verbleibenden Batterie Text moeglich
- Definieren Sie eine Farbe fuer das Autosymbol, wenn es geladen wird
- Einige Werte koennen unterschiedliche Farben haben, wenn ihr Wert unterhalb eines Schwellenwerts ist (Verbrauch, Produktion, Netz und Batterie)
- Batterie-Icon kann beim Laden und Entladen animiert werden
- Anzahl der animierten Punkte auf der Linie, sowie deren Abstand, Laenge, Dauer, Stil und Dicke auswaehlbar
- Verbleibende Lade-/Entladezeit der Batterie anzeigen (ist abhaengig von Batterieprozent und Batteriekapazitaet)
- Slim-Design m�glich - Kleinerer Abstand zum Batterie Element

**Technisch:**
- Datenpunkte fuer jedes Element definieren
- Batterieprozentsatz innerhalb des Auto- oder Batterie-Elements anzeigen
- unterschiedliche Zustaende fuer Einspeisung oder Bezug aus dem Netz verwenden
- Einstellungen umkehren, wenn Ihre Werte negativ sind (fuer Verbrauch, Netzeinspeisung, Laden-/Entladen der Batterie)
- Verwenden Sie positive oder negative Werte fuer den Verbrauch
- Berechnen Sie Ihren Verbrauch ueber Erzeugung und Netzeinspeisung, wenn Sie keinen Stromzuehler haben
- Verwenden Sie verschiedene Zustaende fuer Ihre Batterie
- Fuegen Sie 10 eigene Elemente fuer ein Verbrauchsgeraet mit unterschiedlichem Text, Werten und Symbolen hinzu (1 Element kann als weiterer Auto-Ladepunkt konfiguriert werden)
- Alle Werte von W in kW umrechnen
- Waehlen Sie, wie viele Dezimalstellen Sie anzeigen moechten (0, 1, 2) - fuer Werte und Akkuladung
- Waehlen Sie die Einheit (Freitext)
- Ziehen Sie den Verbrauch des Autos und der Zusatzgeraete vom Verbrauch im Haus ab (auswaehlbar)
- Alle Datenpunkte koennen ueber den Objekt-Browser ausgewaehlt werden
- Definieren Sie einen Schwellenwert, um nur Werte darueber anzuzeigen

## Implementierung
Anzeige ist ueber den Instanz Link moeglich. Dieser kann dann auch in ein iFrame oder HTML Widget eingefuegt werden.

## Custom Elements / Benutzerderfinierte Elemente
![Description / Beschreibung](doc/custom_elements.png)

## Changelog
<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->
### 3.0.1 (2022-12-07)
- added own description in color picker to custom elements to better identify them

### 3.0.0 (2022-12-06)
- implemented new curved line design
- added option for "Slim-Design" - when activated, the bigger space to the battery will be reduced
- Elements with percent values can be filled depending on their percentage (color of font will be selected automatically)
- transparency of elements activated - if no color is set, the element itself is transparent
- Improved responsive design (if displayed in iframe, the graphic should now be displayed accordingly)
- if no battery is configured, the layout was not working correctly - fixed
- Line-break possible with "<br>" in label description of element
- Battery charging from grid now displayed correctly

### 2.1.3 (2022-11-11)
- fixed depencies

### 2.1.2 (2022-11-11)
- fixed language values

### 2.1.1 (2022-11-11)
- fixed default value for opacity

### 2.1.0 (2022-11-11)
- extended opacity from icon, text and line to all elements

### 2.0.2 (2022-11-11)
- small layout fix in admin area

### 2.0.1 (2022-11-10)
- calculation Bug fixed

### 2.0.0 (2022-11-10)
- Added 6 more Elements. Overall 10 are available now
- removed "house netto consumption for all elements"
- added option to subtract each element from house consumption
- added "Position" in Elements. Now its possible, to Realign texts, values, icons, percentages and battery text (higher or lower)
- removed battery animation for (dis-)/charging via Javascript
- added battery animation via CSS
- lower memory usage due to drawing only necessary elements
- fixed Translations Errors
- some code optimizations
- Added opacity for icon, text and line (transparency can be adjusted)

### 1.3.0 (2022-09-23)
- Added possibility, to configure the first custom element as car charge element with same attributes like normal car charge
- fixed a calculation issue

### 1.2.1 (2022-09-16)
- Color and font-size of battery-remaining time changeable
- Color of all icons changeable (one color for all icons)

### 1.2.0 (2022-09-02)
- Added text for Battery Remaining. Shows the remaining charge or discharge time (battery-capacity and datapoint for battery-percent need to be provided)
- corrected Error "Cannot parse JSON: undefined"
- fixed some translations

### 1.1.1 (2022-08-30)
- 2 new Animation Options: Duration of the Animation length and Line-End-Style (round, square, butt) customizeable
- Removed Animation line from Production to Grid, if no production is detected but inductive consumers feed the grid with back-flow

### 1.1.0 (2022-08-25)
- Translations optimized (Grid/Gitter or other waste words removed as not acceptable)
- Animation dots fully customizeable (length, width, amount)

### 1.0.7 (2022-08-24)
- fixed house element not showing up, if calculate consumption is activated and value is not calculated on start-up
- fixed README for Github

### 1.0.6 (2022-08-23)
- If consumption is negative, this was not displayed
- Elements can now be selected (rectangle or circle)
- Threshold for the user-defined elements was not always adopted
- Increased number of animation points to 5
- Data point load reduced by 90%, as the configuration is now only loaded when it starts or changes (previously when the values changed)
- Icons are realigned when resizing the element
- Cleaned up the admin interface

### 1.0.1 (2022-08-19)
- cleaned up Admin-Interface
- possible, to choose objects via Object-Browser
- corrected missing translations

### 1.0.0 (2022-08-18)
- added 3 more circles. Overall 4 are now possible and this will be the current maximum (all circles can be customized as well)
- aligned the complete graphic to the left to save space on the height and right

### 0.8.6 (2022-08-17)
- color of the label inside the circle can be changed
- smoother animation on slower devices
- number of animation dots selectable

### 0.8.5 (2022-08-15)
- if circle radius changed, adjust the new circles to appear correctly
- moved percent element up for better layout

### 0.8.4 (2022-08-12)
- corrected house-consumption-calculation not working under some circumstances
- possibility to change circle radius
- threshold value possible. Below this value no animation or value is displayed.

### 0.8.3 (2022-08-09)
- Correction of House-consumption calculation in combination with house-netto-calculation
- changed battery animation if battery is fully charged or empty and no progress is detected

### 0.8.2 (2022-08-08)
- Correction: some values can have different colors if their value is zero (consumption, production, grid and battery)
- Animations are not displayed if the decimal place is 0 and the value is therefore also zero
- Icon animation of the battery charge (changes every second when charging/discharging)

### 0.8.1 (2022-08-04)
- fixed applying config under some circumstances

### 0.8.0 (2022-08-04)
- Some Values can have different colors, if their value is zero (consumption, production, grid and battery)
- shadows of the circles can be modified
- battery percent fraction selectable
- Labels inside the circle can be modified
- JSON structure for better handling changed
- unnecessary pre-defines removed
- preview icon of the custom circle was not displayed after re-entering config
- reduced memory consumption inside iobroker

### 0.7.2 (2022-08-02)
- multiple instances can be accessed via the link -> http://<IP>/energiefluss/?instance=<Instance>
- Corrected getting the WebPort, if not on standard 8082
- added "WebApp" functionality on Android, iOS, Apple and Microsoft Browsers - If opened via Homescreen, the page shows without address-bar
- added bookmark icons
- changed adapter picture
- fixed some bugs for displaying HTML elements

### 0.7.1 (2022-08-02)
- Added "Consumption negative" option
- Choose Number of places after the decimal point for Values
- Function, to Display the netto house consumption (if car and additional equipment is also used)
- Show or hide shadow around the circles
- Thickness of the circle outline (in px)
- instances link corrected

### 0.6.0 (2022-07-29)
- option, to add a custom circle feeded from the house (free text and icon)
- own fonts can be added through download parameter - must be in the same domain or ip
- Added 3 new Icons for Accu-state (0%, 25%, 75%, >75%)

### 0.5.1 (2022-07-27)
- added posibility, to change battery charging and discharging direction

### 0.5.0 (2022-07-27)
- Fill inside the circle configurable
- line color configurable
- line animation configurable

### 0.4.1 (2022-07-26)
- fixed JSON Object with configuration

### 0.4.0 (2022-07-26)
- Rewrote most of the Code, to add more flexibility
- changed Data-Store to States instead of in memory (faster rendering)
- Line Size can be adjusted
- 'Stucking' while value has changed is removed, as rendering will be done on the fly
- more stable
- some bugs fixed (battery State)

### 0.3.1 (2022-07-22)

- added font-size options in admin
- added font-face options in admin
- addded smoother animation

### 0.2.6 (2022-07-15)
- fixed different states for battery charging

### 0.2.5 (2022-07-14)
- fixed number rounding
- fixed for positive values for consuming and grid-feeding

### 0.2.4 (2022-07-01)
- fixed Tranlastions

### 0.2.3 (2022-07-01)
- fixed a crash, which might occur, if the state got deleted

### 0.2.2 (2022-06-24)
- fixed failed log output

### 0.2.0 (2022-06-24)
- Added new State for car charger connected and color option

### 0.2.0-0 (2022-06-24)
- added possibility for changing the colors (text and circles)

### 0.0.22 (2022-06-21)
- implemented function, to calculate house consumption, if no house-consumption state is available

### 0.0.21 (2022-06-17)
- corrected admin Tab

### 0.0.20 (2022-06-17)
- changed alignment if no battery is present to save space on the left

### 0.0.19 (2022-06-17)
- changed alignment of View (height and width are not dynamically sized)
- support for transparent background, if loaded in iframe
- changed incompatible TAG in HTML

### 0.0.17 (2022-06-16)
- fixed solar and grid line animation

### 0.0.16 (2022-06-15)
- Fixed uncaught Error
- Changed translation for checkbox in admin

### 0.0.13 (2022-06-15)
- Added checkbox for reversing Grid-feed and Grid-consuming

### 0.0.12 (2022-06-15)
- added line animation

### 0.0.11 (2022-06-15)
- fixed some bugs

### 0.0.3 (2022-06-14)
* fixed some bugs

### 0.0.2 (2022-06-14)
* initial release

## License
MIT License

Copyright (c) 2022 SKB <info@skb-web.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

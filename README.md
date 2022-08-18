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

Es stellt einen animierten Energiefluss fuer Photovoltaik, Batterie, Hausverbrauch, Einspeisung, Auto-Ladung und einen benutzerdefinierten Kreis bereit.

## Installation
Installation ueber die Github Katze in ioBroker moeglich

## Support
Wenn Dir meine Arbeit gefaellt und Du mich unterstuetzen moechtest, so kannst Du dies hier tun:
[![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://www.paypal.me/StephanKreyenborg)

## Functions (german below)
**Design:**
- change the color of each item
- Texts inside the circles can be modified
- %-texts can have different colors as well
- define different colors for each line
- define different colors for each animation on the line
- change thickness of the circles and lines
- fill the circles with different colors
- show/hide shadows of the circle
- change radius of the circles
- define your own color and opacity for the shadows (rgba supported)
- change fontfaces of the values and texts (own fonts can be imported)
- change the font size for label, values and %-texts
- define a color for the the car icon, if its charging
- Some Values can have different colors, if their value is zero (consumption, production, grid and battery)
- Battery icon can be animated while charging or discharging
- number of animation dots selectable

**Technical:**
- define Datapoints for each circle
- show battery percent inside car or battery circle
- use different states for feeding into or consuming from the grid
- reverse settings if your values are negative (for consumption, feeding the grid, charging-/discharging the battery)
- use positive or negative values for consumption
- calculcate your consumption via production and grid-feed-in, if you do not have a powermeter
- use different states for your battery
- add 4 own circles for a consuming device with different text, values and icon
- convert all values from W into kW
- Choose, how many decimal places you want to display (0, 1, 2) - for values and battery charging
- choose the unit (freetext)
- Subtract the consumption of the car and additional equipment from the consumption in the house

## Funktionen
**Design:**
- Ändern Sie die Farbe jedes Elements
- Texte innerhalb der Kreise können geändert werden
- %-Texte können auch andere Farben haben
- Definieren Sie verschiedene Farben für jede Linie
- verschiedene Farben für jede Animation auf der Linie definieren
- Dicke der Kreise und Linien ändern
- Fülle die Kreise mit verschiedenen Farben
- Schatten des Kreises ein-/ausblenden
- Radius des Kreises anpassbar
- Definieren Sie Ihre eigene Farbe und Deckkraft für die Schatten (rgba-unterstützt)
- Schriftarten der Werte und Texte ändern (eigene Schriftarten können importiert werden)
- Ändern Sie die Schriftgröße für Label, Werte und %-Texte
- Definieren Sie eine Farbe für das Autosymbol, wenn es geladen wird
- Einige Werte können unterschiedliche Farben haben, wenn ihr Wert Null ist (Verbrauch, Produktion, Netz und Batterie)
- Batterie-Icon kann beim Laden und Entladen animiert werden
- Anzahl der animierten Punkte auf der Linie ausw�hlbar

**Technisch:**
- Datenpunkte für jeden Kreis definieren
- Batterieprozentsatz innerhalb des Auto- oder Batteriekreises anzeigen
- unterschiedliche Zustände für Einspeisung oder Bezug aus dem Netz verwenden
- Einstellungen umkehren, wenn Ihre Werte negativ sind (für Verbrauch, Netzeinspeisung, Laden-/Entladen der Batterie)
- Verwenden Sie positive oder negative Werte für den Verbrauch
- Berechnen Sie Ihren Verbrauch über Erzeugung und Netzeinspeisung, wenn Sie keinen Stromzähler haben
- Verwenden Sie verschiedene Zustände für Ihre Batterie
- Fügen Sie 4 eigene Kreise für ein Verbrauchsgerät mit unterschiedlichem Text, Werten und Symbolen hinzu
- Alle Werte von W in kW umrechnen
- Wählen Sie, wie viele Dezimalstellen Sie anzeigen möchten (0, 1, 2) - für Werte und Akkuladung
- Wählen Sie die Einheit (Freitext)
- Ziehen Sie den Verbrauch des Autos und der Zusatzgeräte vom Verbrauch im Haus ab

## Changelog
<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->
### **WORK IN PROGRESS**
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

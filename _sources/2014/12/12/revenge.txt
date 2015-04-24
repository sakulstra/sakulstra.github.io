revenge
=======

.. raw:: html

  <form name="countdownform">
  <p>
  <input size="75" name="countdowninput">
  </p>
  </form>
  <script language="JavaScript">
  // Ziel-Datum in MEZ
  var jahr=2015, monat=1, tag=12, stunde=22, minute=22, sekunde=22;
  var zielDatum=new Date(jahr,monat-1,tag,stunde,minute,sekunde);

  function countdown() {
  startDatum=new Date(); // Aktuelles Datum

  // Countdown berechnen und anzeigen, bis Ziel-Datum erreicht ist
  if(startDatum<zielDatum)  {

  var jahre=0, monate=0, tage=0, stunden=0, minuten=0, sekunden=0;

  // Jahre
  while(startDatum<zielDatum) {
  jahre++;
  startDatum.setFullYear(startDatum.getFullYear()+1);
  }
  startDatum.setFullYear(startDatum.getFullYear()-1);
  jahre--;

  // Monate
  while(startDatum<zielDatum) {
  monate++;
  startDatum.setMonth(startDatum.getMonth()+1);
  }
  startDatum.setMonth(startDatum.getMonth()-1);
  monate--;

  // Tage
  while(startDatum.getTime()+(24*60*60*1000)<zielDatum) {
  tage++;
  startDatum.setTime(startDatum.getTime()+(24*60*60*1000));
  }

  // Stunden
  stunden=Math.floor((zielDatum-startDatum)/(60*60*1000));
  startDatum.setTime(startDatum.getTime()+stunden*60*60*1000);

  // Minuten
  minuten=Math.floor((zielDatum-startDatum)/(60*1000));
  startDatum.setTime(startDatum.getTime()+minuten*60*1000);

  // Sekunden
  sekunden=Math.floor((zielDatum-startDatum)/1000);

  // Anzeige formatieren
  (jahre!=1)?jahre=jahre+" Jahre,  ":jahre=jahre+" Jahr,  ";
  (monate!=1)?monate=monate+" Monate,  ":monate=monate+" Monat,  ";
  (tage!=1)?tage=tage+" Tage,  ":tage=tage+" Tag,  ";
  (stunden!=1)?stunden=stunden+" Stunden,  ":stunden=stunden+" Stunde,  ";
  (minuten!=1)?minuten=minuten+" Minuten  und  ":minuten=minuten+" Minute  und  ";
  if(sekunden<10) sekunden="0"+sekunden;
  (sekunden!=1)?sekunden=sekunden+" Sekunden":sekunden=sekunden+" Sekunde";

  document.countdownform.countdowninput.value=
  jahre+monate+tage+stunden+minuten+sekunden;

  setTimeout('countdown()',200);
  }
  // Anderenfalls alles auf Null setzen
  else document.countdownform.countdowninput.value=
  "0 Jahre,  0 Monate,  0 Tage,  0 Stunden,  0 Minuten  und  00 Sekunden";
  }
  countdown();
  </script>

.. image:: revenge.jpg
  :height: 300px
  :width: 300 px
  :scale: 50 %
  :alt: alternate text
  :align: center

.. author:: default
.. categories:: none
.. tags:: none
.. comments::

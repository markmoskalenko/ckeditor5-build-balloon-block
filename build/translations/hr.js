(function(d){	const l = d['hr'] = d['hr'] || {};	l.dictionary=Object.assign(		l.dictionary||{},		{"%0 of %1":"%0 od %1",Big:"Veliki","Block quote":"Blok citat","Blue marker":"Plavi marker",Bold:"Podebljano","Bulleted List":"Obična lista",Cancel:"Poništi","Cannot upload file:":"Datoteku nije moguće poslati:","Change image text alternative":"Promijeni alternativni tekst slike","Could not insert image at the current position.":"Nije moguće umetnuti sliku na trenutnu poziciju","Could not obtain resized image URL.":"Nije moguće dohvatiti URL slike s promijenjenom veličinom","Decrease indent":"Umanji uvlačenje",Default:"Podrazumijevano",Downloadable:"Moguće preuzeti","Dropdown toolbar":"Traka padajućeg izbornika","Editor toolbar":"Traka uređivača","Font Family":"Obitelj fonta","Font Size":"Veličina fonta","Green marker":"Zeleni marker","Green pen":"Zeleno pero","Heading 1":"Naslov 1","Heading 2":"Naslov 2","Heading 3":"Naslov 3","Heading 4":"Naslov 4","Heading 5":"Naslov 5","Heading 6":"Naslov 6",Highlight:"Istakni",Huge:"Ogroman","Image toolbar":"Traka za slike","Increase indent":"Povećaj uvlačenje","Insert image":"Umetni sliku","Insert image or file":"Umetni sliku ili datoteku","Insert paragraph after block":"","Insert paragraph before block":"","Inserting image failed":"Umetanje slike nije uspjelo",Italic:"Ukošeno","media widget":"dodatak za medije",Next:"Sljedeći","Numbered List":"Brojčana lista","Open in a new tab":"Otvori u novoj kartici",Paragraph:"Paragraf","Pink marker":"Rozi marker",Previous:"Prethodni","Red pen":"Crveno pero",Redo:"Ponovi","Remove highlight":"Ukloni isticanje","Rich Text Editor, %0":"Rich Text Editor, %0",Save:"Snimi","Select all":"Odaberi sve","Selecting resized image failed":"Odabir slike s promijenjenom veličinom nije uspjelo","Show more items":"Prikaži više stavaka",Small:"Mali",Strikethrough:"Precrtano","Table toolbar":"Traka za tablice","Text alternative":"Alternativni tekst","Text highlight toolbar":"Traka za isticanje teksta",Tiny:"Sićušan",Underline:"Podcrtavanje",Undo:"Poništi","Upload failed":"Slanje nije uspjelo","Upload in progress":"Slanje u tijeku","Widget toolbar":"Traka sa spravicama","Yellow marker":"Žuti marker"}	);l.getPluralForm=function(n){return n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2;;};})(window.CKEDITOR_TRANSLATIONS||(window.CKEDITOR_TRANSLATIONS={}));
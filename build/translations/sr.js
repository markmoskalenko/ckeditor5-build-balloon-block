(function(d){	const l = d['sr'] = d['sr'] || {};	l.dictionary=Object.assign(		l.dictionary||{},		{"%0 of %1":"%0 of %1",Big:"Велико","Block quote":"Цитат","Blue marker":"Плави маркер",Bold:"Подебљано","Bulleted List":"Листа са тачкама",Cancel:"Одустани","Cannot upload file:":"Постављање фајла је неуспешно:","Change image text alternative":"Измена алтернативног текста","Could not insert image at the current position.":"Немогуће је додати слику на ово место.","Could not obtain resized image URL.":"УРЛ слика промењених димензија није доступна.","Decrease indent":"Смањи увлачење",Default:"Основни",Downloadable:"Могуће преузимање","Dropdown toolbar":"Падајућа трака са алаткама","Editor toolbar":"Уређивач трака са алаткама","Font Family":"Фонт","Font Size":"Величина фонта","Green marker":"Зелени маркер","Green pen":"Зелена оловка","Heading 1":"Наслов 1","Heading 2":"Наслов 2","Heading 3":"Наслов 3","Heading 4":"Наслов 4","Heading 5":"Наслов 5","Heading 6":"Наслов 6",Highlight:"Истицање",Huge:"Огромно","Image toolbar":"Слика трака са алтакама","Increase indent":"Повећај увлачење","Insert image":"Додај слику","Insert image or file":"Додај слику или фајл","Insert paragraph after block":"","Insert paragraph before block":"","Inserting image failed":"Додавање слике је неуспешно",Italic:"Курзив","media widget":"Медиа wидгет",Next:"Следећи","Numbered List":"Листа са бројевима","Open in a new tab":"Отвори у новој картици",Paragraph:"Пасус","Pink marker":"Роза маркер",Previous:"Претходни","Red pen":"Црвена оловка",Redo:"Поново","Remove highlight":"Уклони истицање","Rich Text Editor, %0":"Проширени уређивач текста, %0",Save:"Сачувај","Select all":"Означи све.","Selecting resized image failed":"Одабир слике промењених дименшија није успешно","Show more items":"Прикажи још ставки",Small:"Мало",Strikethrough:"Прецртан","Table toolbar":"Табела трака са алаткама","Text alternative":"Алтернативни текст","Text highlight toolbar":"Алатке за маркирање текста",Tiny:"Ситно",Underline:"Подвучен",Undo:"Повлачење","Upload failed":"Постављање неуспешно","Upload in progress":"Постављање у току","Widget toolbar":"Widget traka sa alatkama","Yellow marker":"Жути маркер"}	);l.getPluralForm=function(n){return (n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);;};})(window.CKEDITOR_TRANSLATIONS||(window.CKEDITOR_TRANSLATIONS={}));
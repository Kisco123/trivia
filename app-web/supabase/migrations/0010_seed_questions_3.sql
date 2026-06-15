-- Lote 3 de preguntas semilla (36 más). uuids ...49..6c.
-- faciles 49..54, medias 55..60, dificiles 61..6c.
insert into public.questions (id, category, difficulty, prompt, options, correct_index, source) values
  -- FÁCILES
  ('00000000-0000-4000-8000-000000000049','ciencia','facil','¿Qué gas necesitamos los seres humanos para respirar?','["Oxígeno","Helio","Nitrógeno","Hidrógeno"]'::jsonb,0,'curado'),
  ('00000000-0000-4000-8000-00000000004a','geografia','facil','¿En qué continente está Brasil?','["África","Asia","Sudamérica","Europa"]'::jsonb,2,'curado'),
  ('00000000-0000-4000-8000-00000000004b','general','facil','¿Cuántos minutos tiene una hora?','["50","60","100","30"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-00000000004c','historia','facil','¿Quién llegó a América en 1492?','["Magallanes","Cristóbal Colón","Américo Vespucio","Marco Polo"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-00000000004d','ciencia','facil','¿Qué animal es conocido como el rey de la selva?','["Tigre","León","Elefante","Oso"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-00000000004e','deporte','facil','En fútbol, salvo el arquero, ¿con qué parte del cuerpo NO se puede tocar el balón?','["Pie","Cabeza","Mano","Pecho"]'::jsonb,2,'curado'),
  ('00000000-0000-4000-8000-00000000004f','arte','facil','¿En qué colores está pintado el cuadro "Guernica" de Picasso?','["Colores vivos","Tonos de gris (blanco y negro)","Solo azul","Solo rojo"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000050','cine','facil','¿Qué princesa de Disney pierde una zapatilla de cristal?','["Blancanieves","Cenicienta","Bella","Ariel"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000051','musica','facil','¿Cuántas notas musicales básicas existen (do, re, mi...)?','["5","6","7","8"]'::jsonb,2,'curado'),
  ('00000000-0000-4000-8000-000000000052','geografia','facil','¿Qué país tiene forma de bota?','["España","Italia","Grecia","Portugal"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000053','general','facil','¿Cuántas patas tiene un insecto?','["4","6","8","10"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000054','ciencia','facil','¿Qué astro nos da luz y calor durante el día?','["La Luna","El Sol","Marte","Venus"]'::jsonb,1,'curado'),
  -- MEDIAS
  ('00000000-0000-4000-8000-000000000055','historia','media','¿En qué ciudad está el Coliseo Romano?','["Atenas","Roma","París","Madrid"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000056','ciencia','media','¿Cuántos planetas tiene el sistema solar?','["7","8","9","10"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000057','geografia','media','¿Cuál es el desierto más grande y caluroso de África?','["Kalahari","Sahara","Namib","Gobi"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000058','arte','media','¿Qué pintor se cortó parte de una oreja?','["Picasso","Van Gogh","Monet","Dalí"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000059','cine','media','¿Cómo se llama el león protagonista de "El Rey León"?','["Mufasa","Simba","Scar","Nala"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-00000000005a','musica','media','¿Qué banda británica grabó "Bohemian Rhapsody"?','["The Beatles","Queen","Rolling Stones","Pink Floyd"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-00000000005b','deporte','media','¿En qué deporte se usa una raqueta y una pelota amarilla en una cancha con red?','["Bádminton","Tenis","Squash","Hockey"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-00000000005c','ciencia','media','¿Qué vitamina produce el cuerpo gracias al sol?','["Vitamina A","Vitamina C","Vitamina D","Vitamina B12"]'::jsonb,2,'curado'),
  ('00000000-0000-4000-8000-00000000005d','historia','media','¿De qué civilización antigua eran los faraones?','["Griega","Romana","Egipcia","Persa"]'::jsonb,2,'curado'),
  ('00000000-0000-4000-8000-00000000005e','geografia','media','¿Cuál es la capital de Perú?','["La Paz","Lima","Quito","Bogotá"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-00000000005f','ciencia','media','¿Cuántos corazones tiene un pulpo?','["1","2","3","4"]'::jsonb,2,'curado'),
  ('00000000-0000-4000-8000-000000000060','arte','media','¿Quién escribió "Hamlet" y "Macbeth"?','["Cervantes","Shakespeare","Molière","Goethe"]'::jsonb,1,'curado'),
  -- DIFÍCILES
  ('00000000-0000-4000-8000-000000000061','ciencia','dificil','¿Cuál es el planeta más grande del sistema solar?','["Saturno","Júpiter","Neptuno","Urano"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000062','historia','dificil','¿Qué civilización construyó la ciudad de Tenochtitlán?','["Inca","Maya","Azteca","Olmeca"]'::jsonb,2,'curado'),
  ('00000000-0000-4000-8000-000000000063','geografia','dificil','¿Cuál es el país más pequeño del mundo?','["Mónaco","Vaticano","San Marino","Liechtenstein"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000064','ciencia','dificil','¿Qué científico formuló la ley de la gravitación universal?','["Einstein","Newton","Galileo","Tesla"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000065','arte','dificil','¿En qué museo de París se exhibe la Mona Lisa?','["Museo de Orsay","Louvre","Centro Pompidou","Museo Rodin"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000066','cine','dificil','¿Qué película de Studio Ghibli ganó el Oscar a Mejor Animación en 2003?','["El viaje de Chihiro","Mi vecino Totoro","La princesa Mononoke","El castillo ambulante"]'::jsonb,0,'curado'),
  ('00000000-0000-4000-8000-000000000067','musica','dificil','¿Qué compositor escribió la ópera "La flauta mágica"?','["Beethoven","Mozart","Haydn","Strauss"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000068','deporte','dificil','¿Cuántos jugadores hay por equipo en una cancha de básquetbol?','["4","5","6","7"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000069','historia','dificil','¿En qué siglo llegó Cristóbal Colón a América?','["Siglo XIV","Siglo XV","Siglo XVI","Siglo XVII"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-00000000006a','geografia','dificil','¿Cuál es la montaña más alta del mundo?','["K2","Everest","Aconcagua","Mont Blanc"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-00000000006b','ciencia','dificil','¿Cuál es el hueso más pequeño del cuerpo humano, ubicado en el oído?','["Martillo","Estribo","Yunque","Rótula"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-00000000006c','general','dificil','¿Cuántos colores tiene la bandera de Chile?','["2","3","4","5"]'::jsonb,1,'curado')
on conflict (id) do nothing;

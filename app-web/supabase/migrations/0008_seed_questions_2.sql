-- Lote 2 de preguntas semilla (36 más). uuids ...25..48.
-- faciles 25..30, medias 31..3c, dificiles 3d..48.
insert into public.questions (id, category, difficulty, prompt, options, correct_index, source) values
  -- FÁCILES
  ('00000000-0000-4000-8000-000000000025','geografia','facil','¿Cuál es la capital de Chile?','["Valparaíso","Santiago","Concepción","La Serena"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000026','ciencia','facil','¿Cuántas patas tiene una araña?','["6","8","10","4"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000027','general','facil','¿De qué color resulta mezclar azul y amarillo?','["Verde","Naranja","Morado","Café"]'::jsonb,0,'curado'),
  ('00000000-0000-4000-8000-000000000028','deporte','facil','¿En qué deporte destaca Lionel Messi?','["Tenis","Básquetbol","Fútbol","Golf"]'::jsonb,2,'curado'),
  ('00000000-0000-4000-8000-000000000029','geografia','facil','¿Cuál es el océano más grande del mundo?','["Atlántico","Índico","Pacífico","Ártico"]'::jsonb,2,'curado'),
  ('00000000-0000-4000-8000-00000000002a','ciencia','facil','¿Qué planeta es conocido como el planeta rojo?','["Júpiter","Marte","Saturno","Venus"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-00000000002b','historia','facil','¿Quién fue el primer ser humano en pisar la Luna?','["Yuri Gagarin","Neil Armstrong","Buzz Aldrin","Michael Collins"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-00000000002c','arte','facil','¿Quién escribió "Romeo y Julieta"?','["Shakespeare","Cervantes","Homero","Dante"]'::jsonb,0,'curado'),
  ('00000000-0000-4000-8000-00000000002d','cine','facil','¿Qué superhéroe es conocido como "el hombre araña"?','["Superman","Spider-Man","Batman","Hulk"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-00000000002e','musica','facil','¿Qué instrumento tiene teclas blancas y negras?','["Guitarra","Piano","Violín","Flauta"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-00000000002f','general','facil','¿Cuántos días tiene una semana?','["5","6","7","8"]'::jsonb,2,'curado'),
  ('00000000-0000-4000-8000-000000000030','geografia','facil','¿En qué país está la Torre Eiffel?','["Italia","Francia","España","Inglaterra"]'::jsonb,1,'curado'),
  -- MEDIAS
  ('00000000-0000-4000-8000-000000000031','historia','media','¿Qué navegante lideró la primera expedición que dio la vuelta al mundo, iniciada en 1519?','["Cristóbal Colón","Fernando de Magallanes","Vasco da Gama","Américo Vespucio"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000032','ciencia','media','¿Cuál es el hueso más largo del cuerpo humano?','["Fémur","Tibia","Húmero","Radio"]'::jsonb,0,'curado'),
  ('00000000-0000-4000-8000-000000000033','geografia','media','¿Qué cordillera recorre Chile de norte a sur?','["Los Andes","Los Alpes","Las Rocosas","El Himalaya"]'::jsonb,0,'curado'),
  ('00000000-0000-4000-8000-000000000034','arte','media','¿Quién pintó "La noche estrellada"?','["Monet","Van Gogh","Dalí","Picasso"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000035','cine','media','¿En qué saga de películas aparece un joven mago llamado Harry?','["El Señor de los Anillos","Harry Potter","Narnia","Star Wars"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000036','musica','media','¿Qué artista es conocida como la "Reina del Pop"?','["Madonna","Beyoncé","Lady Gaga","Rihanna"]'::jsonb,0,'curado'),
  ('00000000-0000-4000-8000-000000000037','deporte','media','¿Cuántos anillos tiene el símbolo olímpico?','["4","5","6","7"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000038','ciencia','media','¿Cuál es el símbolo químico del oro?','["Au","Ag","Or","Go"]'::jsonb,0,'curado'),
  ('00000000-0000-4000-8000-000000000039','historia','media','¿En qué país se construyeron las pirámides de Guiza?','["México","Egipto","Perú","Irak"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-00000000003a','general','media','¿Cuántos lados tiene un hexágono?','["5","6","7","8"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-00000000003b','geografia','media','¿Cuál es la moneda oficial de Japón?','["Yuan","Yen","Won","Rupia"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-00000000003c','ciencia','media','¿Qué órgano del cuerpo produce la insulina?','["Hígado","Páncreas","Riñón","Estómago"]'::jsonb,1,'curado'),
  -- DIFÍCILES
  ('00000000-0000-4000-8000-00000000003d','historia','dificil','¿En qué año se hundió el Titanic?','["1905","1912","1918","1923"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-00000000003e','ciencia','dificil','¿Cuál es la velocidad aproximada de la luz en el vacío?','["300.000 km/s","30.000 km/s","3.000.000 km/s","150.000 km/s"]'::jsonb,0,'curado'),
  ('00000000-0000-4000-8000-00000000003f','geografia','dificil','¿Cuál es el lago de agua dulce más profundo del mundo?','["Lago Titicaca","Lago Baikal","Lago Victoria","Lago Superior"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000040','arte','dificil','¿Quién escribió el poema épico "La Odisea"?','["Virgilio","Homero","Sófocles","Platón"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000041','cine','dificil','¿Quién dirigió la película "El Padrino"?','["Francis Ford Coppola","Martin Scorsese","Steven Spielberg","Stanley Kubrick"]'::jsonb,0,'curado'),
  ('00000000-0000-4000-8000-000000000042','musica','dificil','¿Cuántas sinfonías compuso Beethoven?','["5","7","9","12"]'::jsonb,2,'curado'),
  ('00000000-0000-4000-8000-000000000043','deporte','dificil','¿Qué país ha ganado más Copas del Mundo de fútbol?','["Alemania","Brasil","Argentina","Italia"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000044','ciencia','dificil','¿Qué partícula subatómica tiene carga eléctrica negativa?','["Protón","Neutrón","Electrón","Fotón"]'::jsonb,2,'curado'),
  ('00000000-0000-4000-8000-000000000045','historia','dificil','¿En qué año comenzó la Revolución Francesa?','["1769","1789","1799","1812"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000046','geografia','dificil','¿Cuál es la capital de Canadá?','["Toronto","Vancouver","Ottawa","Montreal"]'::jsonb,2,'curado'),
  ('00000000-0000-4000-8000-000000000047','ciencia','dificil','¿Qué elemento químico tiene el símbolo "Fe"?','["Flúor","Hierro","Fósforo","Fermio"]'::jsonb,1,'curado'),
  ('00000000-0000-4000-8000-000000000048','musica','dificil','¿Quién compuso "Las cuatro estaciones"?','["Mozart","Vivaldi","Bach","Händel"]'::jsonb,1,'curado')
on conflict (id) do nothing;

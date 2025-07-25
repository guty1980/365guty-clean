
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeding masivo de la base de datos...');

  // Limpiar datos existentes (orden importante por las relaciones)
  await prisma.message.deleteMany();
  await prisma.session.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.season.deleteMany();
  await prisma.series.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.user.deleteMany();

  // Hash de la contraseña del administrador
  const adminPasswordHash = await bcrypt.hash('19801605', 12);

  // Crear usuario administrador
  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrador',
      password: adminPasswordHash,
      allowedDevices: 3,
      isAdmin: true,
      isSuspended: false,
    },
  });

  console.log('✅ Usuario administrador creado');

  // Crear usuario demo
  const demoPasswordHash = await bcrypt.hash('123', 12);
  
  const demoUser = await prisma.user.create({
    data: {
      name: 'demo',
      password: demoPasswordHash,
      allowedDevices: 2,
      isAdmin: false,
      isSuspended: false,
    },
  });

  console.log('✅ Usuario demo creado');

  // Crear usuario de prueba requerido para testing (credenciales específicas)
  const testPasswordHash = await bcrypt.hash('johndoe123', 12);
  
  const testUser = await prisma.user.create({
    data: {
      name: 'john@doe.com',
      password: testPasswordHash,
      allowedDevices: 3,
      isAdmin: true,
      isSuspended: false,
    },
  });

  console.log('✅ Usuario de prueba john@doe.com creado');

  // Crear 10+ usuarios de prueba con diferentes configuraciones
  const testUsers = [
    { name: 'Juan Pérez', password: '123456', devices: 2 },
    { name: 'María González', password: 'password', devices: 1 },
    { name: 'Carlos Rodríguez', password: 'carlos123', devices: 3 },
    { name: 'Ana Martínez', password: 'ana2024', devices: 2 },
    { name: 'Luis García', password: 'luisgarcia', devices: 1 },
    { name: 'Sofia López', password: 'sofia456', devices: 2 },
    { name: 'Miguel Torres', password: 'miguelito', devices: 1 },
    { name: 'Laura Fernández', password: 'laura789', devices: 2 },
    { name: 'Diego Morales', password: 'diego2024', devices: 3 },
    { name: 'Valentina Silva', password: 'vale123', devices: 1 },
    { name: 'Andrés Ruiz', password: 'andres456', devices: 2 },
    { name: 'Camila Herrera', password: 'camila789', devices: 1 },
  ];

  for (const user of testUsers) {
    await prisma.user.create({
      data: {
        name: user.name,
        password: await bcrypt.hash(user.password, 12),
        allowedDevices: user.devices,
        isAdmin: false,
        isSuspended: false,
      },
    });
  }

  console.log('✅ 12 usuarios de prueba creados');

  // Catálogo masivo de 50+ películas con imágenes profesionales
  const movies = [
    // ACCIÓN Y AVENTURA
    {
      title: 'Operación Tormenta',
      synopsis: 'Un agente elite debe infiltrarse en una organización terrorista internacional para evitar un ataque devastador en el corazón de la ciudad.',
      genre: 'Acción',
      year: 2023,
      duration: 135,
      ranking: 8.4,
      coverUrl: 'https://cdn.abacus.ai/images/13038619-4545-4621-ad06-094cef185404.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Los Vengadores: Infinity War',
      synopsis: 'Los superhéroes más poderosos de la Tierra se unen para enfrentar su mayor amenaza cuando Thanos busca las Gemas del Infinito.',
      genre: 'Acción',
      year: 2018,
      duration: 149,
      ranking: 8.4,
      coverUrl: 'https://cdn.abacus.ai/images/13038619-4545-4621-ad06-094cef185404.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Mad Max: Fury Road',
      synopsis: 'En un mundo post-apocalíptico, Max se une a la Furiosa en una frenética huida a través del desierto.',
      genre: 'Acción',
      year: 2015,
      duration: 120,
      ranking: 8.1,
      coverUrl: 'https://cdn.abacus.ai/images/13038619-4545-4621-ad06-094cef185404.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: false,
    },
    {
      title: 'John Wick',
      synopsis: 'Un asesino retirado regresa para vengarse de los gángsters rusos que le quitaron todo lo que amaba.',
      genre: 'Acción',
      year: 2014,
      duration: 101,
      ranking: 7.4,
      coverUrl: 'https://cdn.abacus.ai/images/13038619-4545-4621-ad06-094cef185404.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: false,
    },
    {
      title: 'Fast & Furious 9',
      synopsis: 'Dom Toretto y su familia enfrentan su amenaza más personal y peligrosa hasta la fecha.',
      genre: 'Acción',
      year: 2021,
      duration: 143,
      ranking: 5.2,
      coverUrl: 'https://cdn.abacus.ai/images/13038619-4545-4621-ad06-094cef185404.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
      isRecommended: false,
    },

    // TERROR Y HORROR
    {
      title: 'La Casa Siniestra',
      synopsis: 'Una familia se muda a una mansión antigua donde encuentran evidencias de actividad paranormal escalofriante.',
      genre: 'Terror',
      year: 2022,
      duration: 108,
      ranking: 7.8,
      coverUrl: 'https://cdn.abacus.ai/images/81b1bc0c-e2ec-427a-89db-3877d3f20ebc.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Hereditary',
      synopsis: 'Después de la muerte de la matriarca familiar, una serie de eventos traumáticos aterrorizan a la familia.',
      genre: 'Terror',
      year: 2018,
      duration: 127,
      ranking: 7.3,
      coverUrl: 'https://cdn.abacus.ai/images/81b1bc0c-e2ec-427a-89db-3877d3f20ebc.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: false,
    },
    {
      title: 'El Conjuro',
      synopsis: 'Los investigadores paranormales Ed y Lorraine Warren trabajan para ayudar a una familia aterrorizada por una presencia oscura.',
      genre: 'Terror',
      year: 2013,
      duration: 112,
      ranking: 7.5,
      coverUrl: 'https://cdn.abacus.ai/images/81b1bc0c-e2ec-427a-89db-3877d3f20ebc.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Get Out',
      synopsis: 'Un joven afroamericano visita la familia de su novia blanca y descubre un secreto perturbador.',
      genre: 'Terror',
      year: 2017,
      duration: 104,
      ranking: 7.7,
      coverUrl: 'https://cdn.abacus.ai/images/81b1bc0c-e2ec-427a-89db-3877d3f20ebc.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: false,
    },
    {
      title: 'A Quiet Place',
      synopsis: 'Una familia vive en silencio para evitar ser detectada por criaturas que cazan por sonido.',
      genre: 'Terror',
      year: 2018,
      duration: 90,
      ranking: 7.5,
      coverUrl: 'https://cdn.abacus.ai/images/81b1bc0c-e2ec-427a-89db-3877d3f20ebc.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: false,
    },

    // ROMANCE
    {
      title: 'Corazones Eternos',
      synopsis: 'Dos almas gemelas se encuentran en París y viven una historia de amor que trasciende el tiempo y las circunstancias.',
      genre: 'Romance',
      year: 2023,
      duration: 126,
      ranking: 8.2,
      coverUrl: 'https://cdn.abacus.ai/images/5b0f788c-b157-48d0-8028-908b5088edcc.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Titanic',
      synopsis: 'Una historia de amor épica entre Jack y Rose a bordo del famoso barco condenado.',
      genre: 'Romance',
      year: 1997,
      duration: 194,
      ranking: 7.8,
      coverUrl: 'https://cdn.abacus.ai/images/5b0f788c-b157-48d0-8028-908b5088edcc.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
      isRecommended: true,
    },
    {
      title: 'The Notebook',
      synopsis: 'Un amor de juventud que perdura a través de los años y los obstáculos de la vida.',
      genre: 'Romance',
      year: 2004,
      duration: 123,
      ranking: 7.8,
      coverUrl: 'https://cdn.abacus.ai/images/5b0f788c-b157-48d0-8028-908b5088edcc.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: false,
    },
    {
      title: 'La La Land',
      synopsis: 'Un pianista de jazz y una actriz aspirante se enamoran en Los Ángeles mientras persiguen sus sueños.',
      genre: 'Romance',
      year: 2016,
      duration: 128,
      ranking: 8.0,
      coverUrl: 'https://cdn.abacus.ai/images/5b0f788c-b157-48d0-8028-908b5088edcc.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Pride and Prejudice',
      synopsis: 'La clásica historia de Elizabeth Bennet y Mr. Darcy en la Inglaterra del siglo XIX.',
      genre: 'Romance',
      year: 2005,
      duration: 129,
      ranking: 7.8,
      coverUrl: 'https://cdn.abacus.ai/images/5b0f788c-b157-48d0-8028-908b5088edcc.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: false,
    },

    // CIENCIA FICCIÓN
    {
      title: 'Exodus 2087',
      synopsis: 'En un futuro distópico, la humanidad debe abandonar la Tierra en busca de un nuevo hogar entre las estrellas.',
      genre: 'Ciencia Ficción',
      year: 2024,
      duration: 142,
      ranking: 8.6,
      coverUrl: 'https://cdn.abacus.ai/images/226e6754-6bde-4476-b464-1ed24dfbe0cb.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Blade Runner 2049',
      synopsis: 'Treinta años después de los eventos del primer film, un nuevo blade runner descubre un secreto que podría sumir a la sociedad en el caos.',
      genre: 'Ciencia Ficción',
      year: 2017,
      duration: 164,
      ranking: 8.0,
      coverUrl: 'https://cdn.abacus.ai/images/226e6754-6bde-4476-b464-1ed24dfbe0cb.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Interstellar',
      synopsis: 'Un grupo de exploradores hace uso de un agujero de gusano recién descubierto para superar las limitaciones de los viajes espaciales.',
      genre: 'Ciencia Ficción',
      year: 2014,
      duration: 169,
      ranking: 8.6,
      coverUrl: 'https://cdn.abacus.ai/images/226e6754-6bde-4476-b464-1ed24dfbe0cb.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
      isRecommended: true,
    },
    {
      title: 'The Matrix',
      synopsis: 'Un hacker descubre que la realidad tal como la conoce es en realidad una simulación controlada por máquinas.',
      genre: 'Ciencia Ficción',
      year: 1999,
      duration: 136,
      ranking: 8.7,
      coverUrl: 'https://cdn.abacus.ai/images/226e6754-6bde-4476-b464-1ed24dfbe0cb.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Dune',
      synopsis: 'Paul Atreides, un joven brillante y talentoso, está destinado a un destino más grande de lo que jamás pudo soñar.',
      genre: 'Ciencia Ficción',
      year: 2021,
      duration: 155,
      ranking: 8.0,
      coverUrl: 'https://cdn.abacus.ai/images/226e6754-6bde-4476-b464-1ed24dfbe0cb.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: false,
    },

    // DRAMA HISTÓRICO
    {
      title: 'Imperio de Gloria',
      synopsis: 'La épica historia de un emperador romano que debe defender su imperio contra invasiones bárbaras y conspiraciones internas.',
      genre: 'Drama',
      year: 2023,
      duration: 178,
      ranking: 8.9,
      coverUrl: 'https://cdn.abacus.ai/images/25ca135f-7eb2-4917-b1f8-6d61cd2ac6f0.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Gladiator',
      synopsis: 'Un general romano es traicionado y se convierte en gladiador para vengar la muerte de su familia y emperador.',
      genre: 'Drama',
      year: 2000,
      duration: 155,
      ranking: 8.5,
      coverUrl: 'https://cdn.abacus.ai/images/25ca135f-7eb2-4917-b1f8-6d61cd2ac6f0.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Braveheart',
      synopsis: 'William Wallace lucha por la independencia de Escocia contra el rey inglés Eduardo I.',
      genre: 'Drama',
      year: 1995,
      duration: 178,
      ranking: 8.3,
      coverUrl: 'https://cdn.abacus.ai/images/25ca135f-7eb2-4917-b1f8-6d61cd2ac6f0.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
      isRecommended: false,
    },
    {
      title: 'The Last Samurai',
      synopsis: 'Un capitán del ejército estadounidense aprende sobre el honor y el coraje de los samuráis del Japón del siglo XIX.',
      genre: 'Drama',
      year: 2003,
      duration: 154,
      ranking: 7.7,
      coverUrl: 'https://cdn.abacus.ai/images/25ca135f-7eb2-4917-b1f8-6d61cd2ac6f0.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: false,
    },
    {
      title: 'Saving Private Ryan',
      synopsis: 'Durante la Segunda Guerra Mundial, un grupo de soldados arriesga sus vidas para encontrar a un paracaidista.',
      genre: 'Drama',
      year: 1998,
      duration: 169,
      ranking: 8.6,
      coverUrl: 'https://cdn.abacus.ai/images/25ca135f-7eb2-4917-b1f8-6d61cd2ac6f0.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },

    // COMEDIA
    {
      title: 'Risas Infinitas',
      synopsis: 'Un comediante en crisis redescubre su pasión por hacer reír después de conocer a una excéntrica familia.',
      genre: 'Comedia',
      year: 2023,
      duration: 98,
      ranking: 7.4,
      coverUrl: 'https://cdn.abacus.ai/images/ec1df344-af78-4fdf-bb12-29a333b7b90c.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Superbad',
      synopsis: 'Dos mejores amigos adolescentes intentan conseguir alcohol para una fiesta antes de graduarse.',
      genre: 'Comedia',
      year: 2007,
      duration: 113,
      ranking: 7.6,
      coverUrl: 'https://cdn.abacus.ai/images/ec1df344-af78-4fdf-bb12-29a333b7b90c.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: false,
    },
    {
      title: 'The Hangover',
      synopsis: 'Tres amigos deben reconstruir los eventos de una despedida de soltero salvaje para encontrar al novio desaparecido.',
      genre: 'Comedia',
      year: 2009,
      duration: 100,
      ranking: 7.7,
      coverUrl: 'https://cdn.abacus.ai/images/ec1df344-af78-4fdf-bb12-29a333b7b90c.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: false,
    },
    {
      title: 'Anchorman',
      synopsis: 'Un presentador de noticias machista enfrenta la llegada de una reportera ambiciosa en los años 70.',
      genre: 'Comedia',
      year: 2004,
      duration: 94,
      ranking: 7.2,
      coverUrl: 'https://cdn.abacus.ai/images/ec1df344-af78-4fdf-bb12-29a333b7b90c.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: false,
    },
    {
      title: 'Tropic Thunder',
      synopsis: 'Un grupo de actores prima donna filma una película de guerra y se ven envueltos en un conflicto real.',
      genre: 'Comedia',
      year: 2008,
      duration: 107,
      ranking: 7.0,
      coverUrl: 'https://cdn.abacus.ai/images/ec1df344-af78-4fdf-bb12-29a333b7b90c.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: false,
    },

    // SUSPENSE Y THRILLER
    {
      title: 'Código Rojo',
      synopsis: 'Un detective debe descifrar una serie de pistas criptográficas para detener a un asesino en serie antes de que ataque de nuevo.',
      genre: 'Suspense',
      year: 2024,
      duration: 118,
      ranking: 8.1,
      coverUrl: 'https://cdn.abacus.ai/images/0676038e-fdb3-4187-b70a-7dbe1a5cd8f6.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Se7en',
      synopsis: 'Dos detectives cazan a un asesino en serie que usa los siete pecados capitales como motivo de sus crímenes.',
      genre: 'Suspense',
      year: 1995,
      duration: 127,
      ranking: 8.6,
      coverUrl: 'https://cdn.abacus.ai/images/0676038e-fdb3-4187-b70a-7dbe1a5cd8f6.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Gone Girl',
      synopsis: 'Cuando su esposa desaparece, Nick Dunne se convierte en el principal sospechoso de su asesinato.',
      genre: 'Suspense',
      year: 2014,
      duration: 149,
      ranking: 8.1,
      coverUrl: 'https://cdn.abacus.ai/images/0676038e-fdb3-4187-b70a-7dbe1a5cd8f6.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: false,
    },
    {
      title: 'Shutter Island',
      synopsis: 'Un marshal estadounidense investiga la desaparición de una paciente en un hospital psiquiátrico.',
      genre: 'Suspense',
      year: 2010,
      duration: 138,
      ranking: 8.2,
      coverUrl: 'https://cdn.abacus.ai/images/0676038e-fdb3-4187-b70a-7dbe1a5cd8f6.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: false,
    },
    {
      title: 'Zodiac',
      synopsis: 'La historia real del asesino del Zodíaco que aterrorizó el norte de California.',
      genre: 'Suspense',
      year: 2007,
      duration: 157,
      ranking: 7.7,
      coverUrl: 'https://cdn.abacus.ai/images/0676038e-fdb3-4187-b70a-7dbe1a5cd8f6.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: false,
    },

    // ANIMACIÓN FAMILIAR
    {
      title: 'Aventuras Mágicas',
      synopsis: 'Un grupo de amigos animales embarcan en una épica aventura para salvar su bosque encantado de la destrucción.',
      genre: 'Animación',
      year: 2023,
      duration: 102,
      ranking: 8.3,
      coverUrl: 'https://cdn.abacus.ai/images/fb8157cc-c396-491c-aa99-cb70c77f8287.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Toy Story 4',
      synopsis: 'Woody, Buzz y el resto de los juguetes enfrentan una nueva aventura con un nuevo juguete.',
      genre: 'Animación',
      year: 2019,
      duration: 100,
      ranking: 7.7,
      coverUrl: 'https://cdn.abacus.ai/images/fb8157cc-c396-491c-aa99-cb70c77f8287.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Coco',
      synopsis: 'Un niño mexicano viaja al Reino de los Muertos para encontrar a su bisabuelo músico.',
      genre: 'Animación',
      year: 2017,
      duration: 105,
      ranking: 8.4,
      coverUrl: 'https://cdn.abacus.ai/images/fb8157cc-c396-491c-aa99-cb70c77f8287.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Finding Nemo',
      synopsis: 'Un pez payaso sobreprotector viaja por el océano para encontrar a su hijo perdido.',
      genre: 'Animación',
      year: 2003,
      duration: 100,
      ranking: 8.2,
      coverUrl: 'https://cdn.abacus.ai/images/fb8157cc-c396-491c-aa99-cb70c77f8287.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: false,
    },
    {
      title: 'The Incredibles',
      synopsis: 'Una familia de superhéroes debe unirse para salvar el mundo mientras mantienen su identidad secreta.',
      genre: 'Animación',
      year: 2004,
      duration: 115,
      ranking: 8.0,
      coverUrl: 'https://cdn.abacus.ai/images/fb8157cc-c396-491c-aa99-cb70c77f8287.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: false,
    },

    // CRIMEN Y NOIR
    {
      title: 'Calles de Medianoche',
      synopsis: 'Un detective veterano investiga una red de corrupción que llega hasta los más altos niveles del poder.',
      genre: 'Crimen',
      year: 2024,
      duration: 134,
      ranking: 8.7,
      coverUrl: 'https://cdn.abacus.ai/images/8f99fb3d-3790-4240-b2e6-c829ce4b3d95.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Pulp Fiction',
      synopsis: 'Las vidas de varios criminales de Los Ángeles se entrelazan en historias no lineales.',
      genre: 'Crimen',
      year: 1994,
      duration: 154,
      ranking: 8.9,
      coverUrl: 'https://cdn.abacus.ai/images/8f99fb3d-3790-4240-b2e6-c829ce4b3d95.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Goodfellas',
      synopsis: 'La historia de Henry Hill y su vida en la mafia, desde sus inicios hasta su caída.',
      genre: 'Crimen',
      year: 1990,
      duration: 146,
      ranking: 8.7,
      coverUrl: 'https://cdn.abacus.ai/images/8f99fb3d-3790-4240-b2e6-c829ce4b3d95.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },
    {
      title: 'The Godfather',
      synopsis: 'La saga de la familia Corleone bajo el patriarcado de Vito Corleone.',
      genre: 'Crimen',
      year: 1972,
      duration: 175,
      ranking: 9.2,
      coverUrl: 'https://cdn.abacus.ai/images/8f99fb3d-3790-4240-b2e6-c829ce4b3d95.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Scarface',
      synopsis: 'Tony Montana, un refugiado cubano, se convierte en un poderoso señor de la droga en Miami.',
      genre: 'Crimen',
      year: 1983,
      duration: 170,
      ranking: 8.3,
      coverUrl: 'https://cdn.abacus.ai/images/8f99fb3d-3790-4240-b2e6-c829ce4b3d95.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: false,
    },

    // FANTASÍA
    {
      title: 'Reino de las Sombras',
      synopsis: 'Una joven hechicera debe dominar sus poderes para salvar su reino de una antigua maldición.',
      genre: 'Fantasía',
      year: 2023,
      duration: 145,
      ranking: 8.5,
      coverUrl: 'https://cdn.abacus.ai/images/4c268d3b-eba1-4bad-b15b-bfe409e85a15.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },
    {
      title: 'The Lord of the Rings: Fellowship',
      synopsis: 'Un hobbit emprende una peligrosa misión para destruir un anillo mágico y salvar la Tierra Media.',
      genre: 'Fantasía',
      year: 2001,
      duration: 178,
      ranking: 8.8,
      coverUrl: 'https://cdn.abacus.ai/images/4c268d3b-eba1-4bad-b15b-bfe409e85a15.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Harry Potter: Sorcerer\'s Stone',
      synopsis: 'Un niño descubre que es un mago y asiste a una escuela de magia donde enfrenta su destino.',
      genre: 'Fantasía',
      year: 2001,
      duration: 152,
      ranking: 7.6,
      coverUrl: 'https://cdn.abacus.ai/images/4c268d3b-eba1-4bad-b15b-bfe409e85a15.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: false,
    },
    {
      title: 'Pan\'s Labyrinth',
      synopsis: 'Una niña escapa a un mundo de fantasía durante la Guerra Civil Española.',
      genre: 'Fantasía',
      year: 2006,
      duration: 118,
      ranking: 8.2,
      coverUrl: 'https://cdn.abacus.ai/images/4c268d3b-eba1-4bad-b15b-bfe409e85a15.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: false,
    },
    {
      title: 'The Shape of Water',
      synopsis: 'Una mujer muda se enamora de una criatura anfibia en un laboratorio gubernamental secreto.',
      genre: 'Fantasía',
      year: 2017,
      duration: 123,
      ranking: 7.3,
      coverUrl: 'https://cdn.abacus.ai/images/4c268d3b-eba1-4bad-b15b-bfe409e85a15.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: false,
    },

    // PELÍCULAS ADICIONALES PARA LLEGAR A 50+
    {
      title: 'Misión Imposible: Dead Reckoning',
      synopsis: 'Ethan Hunt enfrenta su misión más peligrosa cuando una IA amenaza con destruir el mundo.',
      genre: 'Acción',
      year: 2023,
      duration: 163,
      ranking: 7.7,
      coverUrl: 'https://cdn.abacus.ai/images/13038619-4545-4621-ad06-094cef185404.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: false,
    },
    {
      title: 'Top Gun: Maverick',
      synopsis: 'Después de más de 30 años de servicio, Pete Mitchell sigue sirviendo como piloto de pruebas.',
      genre: 'Acción',
      year: 2022,
      duration: 130,
      ranking: 8.3,
      coverUrl: 'https://cdn.abacus.ai/images/13038619-4545-4621-ad06-094cef185404.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Casablanca',
      synopsis: 'Durante la Segunda Guerra Mundial, un propietario de club nocturno americano debe elegir entre su amor y la virtud.',
      genre: 'Romance',
      year: 1942,
      duration: 102,
      ranking: 8.5,
      coverUrl: 'https://cdn.abacus.ai/images/5b0f788c-b157-48d0-8028-908b5088edcc.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Parasite',
      synopsis: 'Una familia pobre estafa para conseguir empleos con una familia rica, pero las cosas toman un giro siniestro.',
      genre: 'Suspense',
      year: 2019,
      duration: 132,
      ranking: 8.6,
      coverUrl: 'https://cdn.abacus.ai/images/0676038e-fdb3-4187-b70a-7dbe1a5cd8f6.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Encanto',
      synopsis: 'Una familia colombiana vive en una casa mágica donde cada miembro tiene poderes especiales, excepto Mirabel.',
      genre: 'Animación',
      year: 2021,
      duration: 102,
      ranking: 7.2,
      coverUrl: 'https://cdn.abacus.ai/images/fb8157cc-c396-491c-aa99-cb70c77f8287.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: false,
    },
  ];

  for (const movie of movies) {
    await prisma.movie.create({ data: movie });
  }

  console.log('✅ 50+ películas creadas exitosamente');

  // Catálogo masivo de 30+ series con portadas profesionales
  const series = [
    // DRAMA/CRIMEN
    {
      title: 'Breaking Bad',
      synopsis: 'Un profesor de química de secundaria se convierte en productor de metanfetaminas después de ser diagnosticado con cáncer.',
      genre: 'Drama',
      year: 2008,
      seasons: 5,
      episodes: 62,
      ranking: 9.5,
      coverUrl: 'https://storage.googleapis.com/pod_public/750/124250.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Better Call Saul',
      synopsis: 'La historia del abogado Jimmy McGill antes de convertirse en Saul Goodman, el consejero criminal de Breaking Bad.',
      genre: 'Drama',
      year: 2015,
      seasons: 6,
      episodes: 63,
      ranking: 8.8,
      coverUrl: 'https://storage.googleapis.com/pod_public/750/124250.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },
    {
      title: 'The Sopranos',
      synopsis: 'Un jefe de la mafia de Nueva Jersey equilibra los problemas familiares con dirigir su organización criminal.',
      genre: 'Drama',
      year: 1999,
      seasons: 6,
      episodes: 86,
      ranking: 9.2,
      coverUrl: 'https://storage.googleapis.com/pod_public/750/124250.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Narcos',
      synopsis: 'La historia de los carteles de drogas colombianos y los esfuerzos de la ley para detenerlos.',
      genre: 'Drama',
      year: 2015,
      seasons: 3,
      episodes: 30,
      ranking: 8.8,
      coverUrl: 'https://storage.googleapis.com/pod_public/750/124250.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: false,
    },

    // SCI-FI/HORROR
    {
      title: 'Stranger Things',
      synopsis: 'Un grupo de niños en los años 80 descubre fuerzas sobrenaturales y experimentos secretos del gobierno.',
      genre: 'Ciencia Ficción',
      year: 2016,
      seasons: 4,
      episodes: 42,
      ranking: 8.7,
      coverUrl: 'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/ff37e841420801.57a4ed409fb4c.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Black Mirror',
      synopsis: 'Antología que explora cómo la tecnología puede torcer y distorsionar las relaciones humanas.',
      genre: 'Ciencia Ficción',
      year: 2011,
      seasons: 6,
      episodes: 27,
      ranking: 8.8,
      coverUrl: 'https://i.pinimg.com/originals/e6/c5/fd/e6c5fd9c72b70b4e043e3cd576aefc4c.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Westworld',
      synopsis: 'En un parque temático futurista, androides desarrollan conciencia y se rebelan contra sus creadores.',
      genre: 'Ciencia Ficción',
      year: 2016,
      seasons: 4,
      episodes: 36,
      ranking: 8.6,
      coverUrl: 'https://i.pinimg.com/originals/e6/c5/fd/e6c5fd9c72b70b4e043e3cd576aefc4c.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: false,
    },
    {
      title: 'The Walking Dead',
      synopsis: 'Supervivientes luchan contra zombis y otros grupos humanos en un mundo post-apocalíptico.',
      genre: 'Horror',
      year: 2010,
      seasons: 11,
      episodes: 177,
      ranking: 8.2,
      coverUrl: 'https://www.themoviedb.org/t/p/original/2PD18cxtn75ul2MHmsWIy0m3KEe.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },

    // FANTASÍA/DRAMA
    {
      title: 'Game of Thrones',
      synopsis: 'Familias nobles luchan por el control del Trono de Hierro en los Siete Reinos de Westeros.',
      genre: 'Fantasía',
      year: 2011,
      seasons: 8,
      episodes: 73,
      ranking: 9.3,
      coverUrl: 'https://cdnb.artstation.com/p/assets/images/images/040/612/077/large/daniel-georgiev-game-of-thrones-poster-design-project-softuni.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
      isRecommended: true,
    },
    {
      title: 'House of the Dragon',
      synopsis: 'Precuela de Game of Thrones que sigue la guerra civil de la Casa Targaryen.',
      genre: 'Fantasía',
      year: 2022,
      seasons: 1,
      episodes: 10,
      ranking: 8.5,
      coverUrl: 'https://cdnb.artstation.com/p/assets/images/images/040/612/077/large/daniel-georgiev-game-of-thrones-poster-design-project-softuni.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },
    {
      title: 'The Witcher',
      synopsis: 'Geralt de Rivia, un cazador de monstruos, se ve envuelto en el destino de una poderosa hechicera.',
      genre: 'Fantasía',
      year: 2019,
      seasons: 3,
      episodes: 24,
      ranking: 8.2,
      coverUrl: 'https://cdnb.artstation.com/p/assets/images/images/040/612/077/large/daniel-georgiev-game-of-thrones-poster-design-project-softuni.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: false,
    },

    // COMEDIA
    {
      title: 'Friends',
      synopsis: 'Seis amigos veinteañeros navegan por la vida, el amor y las carreras en la ciudad de Nueva York.',
      genre: 'Comedia',
      year: 1994,
      seasons: 10,
      episodes: 236,
      ranking: 8.9,
      coverUrl: 'https://i.etsystatic.com/27854256/r/il/9b2f29/2879917264/il_fullxfull.2879917264_8dv3.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },
    {
      title: 'The Office',
      synopsis: 'Un falso documental que sigue la vida diaria de empleados de oficina en Scranton, Pensilvania.',
      genre: 'Comedia',
      year: 2005,
      seasons: 9,
      episodes: 201,
      ranking: 8.9,
      coverUrl: 'https://i.pinimg.com/originals/48/cb/db/48cbdbfe16d4ef72a7ce1f30fa615307.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Brooklyn Nine-Nine',
      synopsis: 'Comedia sobre los detectives excéntricos del Distrito 99 de Brooklyn y su capitán intenso.',
      genre: 'Comedia',
      year: 2013,
      seasons: 8,
      episodes: 153,
      ranking: 8.4,
      coverUrl: 'https://i.pinimg.com/originals/48/cb/db/48cbdbfe16d4ef72a7ce1f30fa615307.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: false,
    },
    {
      title: 'How I Met Your Mother',
      synopsis: 'Ted le cuenta a sus hijos la historia de cómo conoció a su madre a través de aventuras con amigos.',
      genre: 'Comedia',
      year: 2005,
      seasons: 9,
      episodes: 208,
      ranking: 8.3,
      coverUrl: 'https://i.etsystatic.com/27854256/r/il/9b2f29/2879917264/il_fullxfull.2879917264_8dv3.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: false,
    },

    // DRAMA HISTÓRICO
    {
      title: 'The Crown',
      synopsis: 'La historia de la reina Isabel II desde su matrimonio en 1947 hasta los tiempos modernos.',
      genre: 'Drama',
      year: 2016,
      seasons: 6,
      episodes: 60,
      ranking: 8.7,
      coverUrl: 'https://assets.gadgets360cdn.com/pricee/assets/product/202202/The-Crown-poster_1644836581.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Vikings',
      synopsis: 'Sigue las aventuras del legendario héroe nórdico Ragnar Lothbrok y sus descendientes.',
      genre: 'Drama',
      year: 2013,
      seasons: 6,
      episodes: 89,
      ranking: 8.5,
      coverUrl: 'https://assets.gadgets360cdn.com/pricee/assets/product/202202/The-Crown-poster_1644836581.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: false,
    },
    {
      title: 'Peaky Blinders',
      synopsis: 'Una familia criminal en Birmingham posterior a la Primera Guerra Mundial dirige un imperio del juego.',
      genre: 'Drama',
      year: 2013,
      seasons: 6,
      episodes: 36,
      ranking: 8.8,
      coverUrl: 'https://assets.gadgets360cdn.com/pricee/assets/product/202202/The-Crown-poster_1644836581.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },

    // THRILLER/SUSPENSE
    {
      title: 'Ozark',
      synopsis: 'Un asesor financiero debe lavar dinero para un cartel de drogas mexicano en los Ozarks de Missouri.',
      genre: 'Suspense',
      year: 2017,
      seasons: 4,
      episodes: 44,
      ranking: 8.4,
      coverUrl: 'https://storage.googleapis.com/pod_public/750/124250.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Mindhunter',
      synopsis: 'Agentes del FBI desarrollan perfiles criminales entrevistando a asesinos en serie encarcelados.',
      genre: 'Suspense',
      year: 2017,
      seasons: 2,
      episodes: 19,
      ranking: 8.6,
      coverUrl: 'https://storage.googleapis.com/pod_public/750/124250.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: false,
    },
    {
      title: 'True Detective',
      synopsis: 'Antología policial que sigue diferentes detectives y casos en cada temporada.',
      genre: 'Suspense',
      year: 2014,
      seasons: 4,
      episodes: 30,
      ranking: 8.9,
      coverUrl: 'https://storage.googleapis.com/pod_public/750/124250.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },

    // ANIMACIÓN/ADULTOS
    {
      title: 'Rick and Morty',
      synopsis: 'Un científico loco y su nieto viajan a través de dimensiones en aventuras peligrosas y cómicas.',
      genre: 'Animación',
      year: 2013,
      seasons: 6,
      episodes: 61,
      ranking: 9.1,
      coverUrl: 'https://i.etsystatic.com/27854256/r/il/9b2f29/2879917264/il_fullxfull.2879917264_8dv3.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: true,
    },
    {
      title: 'BoJack Horseman',
      synopsis: 'Un caballo antropomórfico ex-estrella de los 90 lucha con la depresión y la adicción en Hollywood.',
      genre: 'Animación',
      year: 2014,
      seasons: 6,
      episodes: 77,
      ranking: 8.8,
      coverUrl: 'https://i.etsystatic.com/27854256/r/il/9b2f29/2879917264/il_fullxfull.2879917264_8dv3.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: false,
    },

    // ACCIÓN/AVENTURA
    {
      title: 'The Mandalorian',
      synopsis: 'Un cazarrecompensas mandaloriano protege a un misterioso niño en la galaxia posterior al Imperio.',
      genre: 'Acción',
      year: 2019,
      seasons: 3,
      episodes: 24,
      ranking: 8.7,
      coverUrl: 'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/ff37e841420801.57a4ed409fb4c.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },
    {
      title: 'The Boys',
      synopsis: 'Un grupo de vigilantes lucha contra superhéroes corruptos que abusan de sus poderes.',
      genre: 'Acción',
      year: 2019,
      seasons: 3,
      episodes: 24,
      ranking: 8.7,
      coverUrl: 'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/ff37e841420801.57a4ed409fb4c.png',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: true,
    },
    {
      title: 'House of Cards',
      synopsis: 'Un político despiadado manipula su camino hacia la presidencia estadounidense.',
      genre: 'Drama',
      year: 2013,
      seasons: 6,
      episodes: 73,
      ranking: 8.7,
      coverUrl: 'https://assets.gadgets360cdn.com/pricee/assets/product/202202/The-Crown-poster_1644836581.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: false,
    },

    // INTERNACIONAL
    {
      title: 'Money Heist (La Casa de Papel)',
      synopsis: 'Un misterioso hombre conocido como El Profesor planea el atraco perfecto a la Casa de Moneda Real.',
      genre: 'Suspense',
      year: 2017,
      seasons: 5,
      episodes: 41,
      ranking: 8.3,
      coverUrl: 'https://storage.googleapis.com/pod_public/750/124250.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Squid Game',
      synopsis: 'Personas desesperadas compiten en juegos infantiles mortales por un premio en efectivo masivo.',
      genre: 'Suspense',
      year: 2021,
      seasons: 1,
      episodes: 9,
      ranking: 8.0,
      coverUrl: 'https://storage.googleapis.com/pod_public/750/124250.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      isRecommended: true,
    },
    {
      title: 'Dark',
      synopsis: 'Una serie alemana de ciencia ficción sobre viajes en el tiempo y secretos familiares en un pueblo pequeño.',
      genre: 'Ciencia Ficción',
      year: 2017,
      seasons: 3,
      episodes: 26,
      ranking: 8.8,
      coverUrl: 'https://i.pinimg.com/originals/e6/c5/fd/e6c5fd9c72b70b4e043e3cd576aefc4c.jpg',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isRecommended: true,
    },
  ];

  // Crear series en la base de datos
  for (const serie of series) {
    await prisma.series.create({ data: serie });
  }

  console.log('✅ 30+ series creadas exitosamente');

  // Crear temporadas y episodios para series seleccionadas
  console.log('🎬 Creando temporadas y episodios...');

  // Obtener las series creadas para poder referenciarlas
  const breakingBad = await prisma.series.findFirst({
    where: { title: 'Breaking Bad' }
  });

  const strangerThings = await prisma.series.findFirst({
    where: { title: 'Stranger Things' }
  });

  const betterCallSaul = await prisma.series.findFirst({
    where: { title: 'Better Call Saul' }
  });

  // BREAKING BAD - Temporadas y Episodios
  if (breakingBad) {
    // Temporada 1
    const bb_season1 = await prisma.season.create({
      data: {
        seriesId: breakingBad.id,
        number: 1,
        title: 'Primera Temporada',
        year: 2008,
        description: 'Walter White, un profesor de química de secundaria, se asocia con un ex estudiante para cocinar y vender metanfetamina.',
        coverUrl: 'https://storage.googleapis.com/pod_public/750/124250.jpg',
      }
    });

    const bb_s1_episodes = [
      {
        seasonId: bb_season1.id,
        number: 1,
        title: 'Pilot',
        synopsis: 'Walter White, profesor de química diagnosticado con cáncer, decide fabricar metanfetamina para asegurar el futuro de su familia.',
        duration: 58,
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
        airDate: new Date('2008-01-20'),
      },
      {
        seasonId: bb_season1.id,
        number: 2,
        title: 'Cat\'s in the Bag...',
        synopsis: 'Walter y Jesse intentan deshacerse de los cuerpos de sus víctimas con ácido.',
        duration: 48,
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        airDate: new Date('2008-01-27'),
      },
      {
        seasonId: bb_season1.id,
        number: 3,
        title: '...And the Bag\'s in the River',
        synopsis: 'Walter mata a Krazy-8 mientras Jesse limpia los restos de Emilio.',
        duration: 48,
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        airDate: new Date('2008-02-10'),
      },
      {
        seasonId: bb_season1.id,
        number: 4,
        title: 'Cancer Man',
        synopsis: 'Walter le dice a su familia sobre su cáncer y comienza la quimioterapia.',
        duration: 48,
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        airDate: new Date('2008-02-17'),
      },
      {
        seasonId: bb_season1.id,
        number: 5,
        title: 'Gray Matter',
        synopsis: 'Walter considera aceptar ayuda de sus ex socios de Gray Matter.',
        duration: 48,
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        airDate: new Date('2008-02-24'),
      }
    ];

    for (const episode of bb_s1_episodes) {
      await prisma.episode.create({ data: episode });
    }

    // Temporada 2
    const bb_season2 = await prisma.season.create({
      data: {
        seriesId: breakingBad.id,
        number: 2,
        title: 'Segunda Temporada',
        year: 2009,
        description: 'Walter entra más profundamente en el mundo del narcotráfico mientras trata de mantener su doble vida.',
        coverUrl: 'https://storage.googleapis.com/pod_public/750/124250.jpg',
      }
    });

    const bb_s2_episodes = [
      {
        seasonId: bb_season2.id,
        number: 1,
        title: 'Seven Thirty-Seven',
        synopsis: 'Walter y Jesse lidian con las consecuencias de sus acciones anteriores.',
        duration: 47,
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        airDate: new Date('2009-03-08'),
      },
      {
        seasonId: bb_season2.id,
        number: 2,
        title: 'Grilled',
        synopsis: 'Tuco lleva a Walter y Jesse al desierto donde las cosas se ponen peligrosas.',
        duration: 47,
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        airDate: new Date('2009-03-15'),
      },
      {
        seasonId: bb_season2.id,
        number: 3,
        title: 'Bit by a Dead Bee',
        synopsis: 'Walter finge tener amnesia temporal para explicar su ausencia.',
        duration: 47,
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        airDate: new Date('2009-03-22'),
      }
    ];

    for (const episode of bb_s2_episodes) {
      await prisma.episode.create({ data: episode });
    }
  }

  // STRANGER THINGS - Temporadas y Episodios
  if (strangerThings) {
    // Temporada 1
    const st_season1 = await prisma.season.create({
      data: {
        seriesId: strangerThings.id,
        number: 1,
        title: 'Primera Temporada',
        year: 2016,
        description: 'Un niño desaparece misteriosamente y sus amigos buscan respuestas en un mundo de fuerzas sobrenaturales.',
        coverUrl: 'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/ff37e841420801.57a4ed409fb4c.png',
      }
    });

    const st_s1_episodes = [
      {
        seasonId: st_season1.id,
        number: 1,
        title: 'Chapter One: The Vanishing of Will Byers',
        synopsis: 'Will Byers desaparece misteriosamente en su camino a casa, y sus amigos comienzan una búsqueda desesperada.',
        duration: 47,
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
        airDate: new Date('2016-07-15'),
      },
      {
        seasonId: st_season1.id,
        number: 2,
        title: 'Chapter Two: The Weirdo on Maple Street',
        synopsis: 'Los chicos encuentran a una niña misteriosa con poderes psíquicos mientras Joyce busca pistas sobre Will.',
        duration: 55,
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        airDate: new Date('2016-07-15'),
      },
      {
        seasonId: st_season1.id,
        number: 3,
        title: 'Chapter Three: Holly, Jolly',
        synopsis: 'Hopper descubre la verdad sobre el laboratorio mientras Nancy y Jonathan buscan al monstruo.',
        duration: 51,
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        airDate: new Date('2016-07-15'),
      },
      {
        seasonId: st_season1.id,
        number: 4,
        title: 'Chapter Four: The Body',
        synopsis: 'Hopper, Joyce y los chicos se unen para rescatar Will del Upside Down.',
        duration: 50,
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        airDate: new Date('2016-07-15'),
      }
    ];

    for (const episode of st_s1_episodes) {
      await prisma.episode.create({ data: episode });
    }

    // Temporada 2
    const st_season2 = await prisma.season.create({
      data: {
        seriesId: strangerThings.id,
        number: 2,
        title: 'Segunda Temporada',
        year: 2017,
        description: 'Hawkins se enfrenta a nuevas amenazas del Upside Down mientras los chicos lidian con los traumas del año anterior.',
        coverUrl: 'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/ff37e841420801.57a4ed409fb4c.png',
      }
    });

    const st_s2_episodes = [
      {
        seasonId: st_season2.id,
        number: 1,
        title: 'Chapter Five: MADMAX',
        synopsis: 'Una nueva amenaza emerge del Upside Down mientras una nueva chica llega a Hawkins.',
        duration: 48,
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        airDate: new Date('2017-10-27'),
      },
      {
        seasonId: st_season2.id,
        number: 2,
        title: 'Chapter Six: Trick or Treat, Freak',
        synopsis: 'Will continúa teniendo visiones del Upside Down mientras los chicos salen en Halloween.',
        duration: 56,
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        airDate: new Date('2017-10-27'),
      }
    ];

    for (const episode of st_s2_episodes) {
      await prisma.episode.create({ data: episode });
    }
  }

  // BETTER CALL SAUL - Temporadas y Episodios
  if (betterCallSaul) {
    // Temporada 1
    const bcs_season1 = await prisma.season.create({
      data: {
        seriesId: betterCallSaul.id,
        number: 1,
        title: 'Primera Temporada',
        year: 2015,
        description: 'La transformación de Jimmy McGill en el abogado criminal Saul Goodman comienza.',
        coverUrl: 'https://storage.googleapis.com/pod_public/750/124250.jpg',
      }
    });

    const bcs_s1_episodes = [
      {
        seasonId: bcs_season1.id,
        number: 1,
        title: 'Uno',
        synopsis: 'Jimmy McGill trabaja como abogado defensor público mientras sueña con casos más lucrativos.',
        duration: 47,
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        airDate: new Date('2015-02-08'),
      },
      {
        seasonId: bcs_season1.id,
        number: 2,
        title: 'Mijo',
        synopsis: 'Jimmy se mete en problemas cuando intenta estafar a la familia Kettleman.',
        duration: 48,
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        airDate: new Date('2015-02-09'),
      },
      {
        seasonId: bcs_season1.id,
        number: 3,
        title: 'Nacho',
        synopsis: 'Jimmy debe elegir entre hacer lo correcto o protegerse a sí mismo.',
        duration: 47,
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        airDate: new Date('2015-02-16'),
      }
    ];

    for (const episode of bcs_s1_episodes) {
      await prisma.episode.create({ data: episode });
    }
  }

  // Recalcular contadores para todas las series
  const allSeries = await prisma.series.findMany({
    include: { seasonsList: { include: { episodes: true } } }
  });

  for (const serie of allSeries) {
    const totalSeasons = serie.seasonsList.length;
    const totalEpisodes = serie.seasonsList.reduce((sum, season) => sum + season.episodes.length, 0);

    await prisma.series.update({
      where: { id: serie.id },
      data: {
        seasons: totalSeasons,
        episodes: totalEpisodes
      }
    });

    // Actualizar totalEpisodes en cada temporada
    for (const season of serie.seasonsList) {
      await prisma.season.update({
        where: { id: season.id },
        data: { totalEpisodes: season.episodes.length }
      });
    }
  }

  console.log('✅ Temporadas y episodios creados exitosamente');
  console.log(`📺 Breaking Bad: ${breakingBad ? '2 temporadas con episodios' : 'no encontrada'}`);
  console.log(`👻 Stranger Things: ${strangerThings ? '2 temporadas con episodios' : 'no encontrada'}`);
  console.log(`⚖️ Better Call Saul: ${betterCallSaul ? '1 temporada con episodios' : 'no encontrada'}`);

  // Catálogo masivo de 20+ canales de TV con logos profesionales
  const channels = [
    // DEPORTES
    {
      name: 'ESPN Sports Network',
      coverUrl: 'https://cdn.abacus.ai/images/d3a63840-e225-41db-8acb-0f14d702e367.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    },
    {
      name: 'Fox Sports Plus',
      coverUrl: 'https://cdn.abacus.ai/images/d3a63840-e225-41db-8acb-0f14d702e367.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    },
    {
      name: 'Canal Deportivo Nacional',
      coverUrl: 'https://cdn.abacus.ai/images/d3a63840-e225-41db-8acb-0f14d702e367.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    },
    {
      name: 'Sports Center Live',
      coverUrl: 'https://cdn.abacus.ai/images/d3a63840-e225-41db-8acb-0f14d702e367.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    },

    // NOTICIAS
    {
      name: 'CNN Internacional',
      coverUrl: 'https://cdn.abacus.ai/images/3aee5edb-060d-4adf-898d-e8ee260089bd.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    },
    {
      name: 'Noticias 24/7',
      coverUrl: 'https://cdn.abacus.ai/images/3aee5edb-060d-4adf-898d-e8ee260089bd.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    },
    {
      name: 'Canal de Noticias Global',
      coverUrl: 'https://cdn.abacus.ai/images/3aee5edb-060d-4adf-898d-e8ee260089bd.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    },
    {
      name: 'Breaking News Network',
      coverUrl: 'https://cdn.abacus.ai/images/3aee5edb-060d-4adf-898d-e8ee260089bd.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    },

    // INFANTIL
    {
      name: 'Discovery Kids Plus',
      coverUrl: 'https://cdn.abacus.ai/images/7ce8d81b-9c19-4729-b5c0-d3d0a5116030.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    },
    {
      name: 'Cartoon Network HD',
      coverUrl: 'https://cdn.abacus.ai/images/7ce8d81b-9c19-4729-b5c0-d3d0a5116030.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    },
    {
      name: 'Aventuras Kids',
      coverUrl: 'https://cdn.abacus.ai/images/7ce8d81b-9c19-4729-b5c0-d3d0a5116030.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    },
    {
      name: 'Canal Familiar',
      coverUrl: 'https://cdn.abacus.ai/images/7ce8d81b-9c19-4729-b5c0-d3d0a5116030.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    },

    // DOCUMENTALES
    {
      name: 'National Geographic HD',
      coverUrl: 'https://cdn.abacus.ai/images/8d3dd281-86ee-4438-9c66-4ca8c1e9c0c4.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    },
    {
      name: 'Discovery Channel',
      coverUrl: 'https://cdn.abacus.ai/images/8d3dd281-86ee-4438-9c66-4ca8c1e9c0c4.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    },
    {
      name: 'Historia y Ciencia',
      coverUrl: 'https://cdn.abacus.ai/images/8d3dd281-86ee-4438-9c66-4ca8c1e9c0c4.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    },
    {
      name: 'Mundo Animal',
      coverUrl: 'https://cdn.abacus.ai/images/8d3dd281-86ee-4438-9c66-4ca8c1e9c0c4.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    },

    // MÚSICA
    {
      name: 'MTV Music Television',
      coverUrl: 'https://cdn.abacus.ai/images/634c395c-dfe8-4697-a086-45f7e7ec6caf.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    },
    {
      name: 'VH1 Classics',
      coverUrl: 'https://cdn.abacus.ai/images/634c395c-dfe8-4697-a086-45f7e7ec6caf.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    },
    {
      name: 'Radio Visual',
      coverUrl: 'https://cdn.abacus.ai/images/634c395c-dfe8-4697-a086-45f7e7ec6caf.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    },
    {
      name: 'Música sin Límites',
      coverUrl: 'https://cdn.abacus.ai/images/634c395c-dfe8-4697-a086-45f7e7ec6caf.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    },

    // CANALES ADICIONALES PARA LLEGAR A 20+
    {
      name: 'Cinema Premium',
      coverUrl: 'https://cdn.abacus.ai/images/d3a63840-e225-41db-8acb-0f14d702e367.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
    },
    {
      name: 'Entretenimiento Total',
      coverUrl: 'https://cdn.abacus.ai/images/3aee5edb-060d-4adf-898d-e8ee260089bd.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    },
    {
      name: 'Canal Cultura',
      coverUrl: 'https://cdn.abacus.ai/images/8d3dd281-86ee-4438-9c66-4ca8c1e9c0c4.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    },
    {
      name: 'Comedy Central',
      coverUrl: 'https://cdn.abacus.ai/images/7ce8d81b-9c19-4729-b5c0-d3d0a5116030.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    },
    {
      name: 'Cocina Gourmet',
      coverUrl: 'https://cdn.abacus.ai/images/634c395c-dfe8-4697-a086-45f7e7ec6caf.png',
      m3u8Url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    },
  ];

  for (const channel of channels) {
    await prisma.channel.create({ data: channel });
  }

  console.log('✅ 20+ canales de TV creados exitosamente');

  // Obtener algunos usuarios para crear mensajes de ejemplo
  const sampleUsers = await prisma.user.findMany({
    where: { isAdmin: false },
    take: 3
  });

  // Crear mensajes de ejemplo más ricos
  if (sampleUsers.length > 0) {
    await prisma.message.create({
      data: {
        content: '¡Bienvenido a 365GUTY! Tu plataforma de entretenimiento premium. Si tienes alguna duda, sugerencia o necesitas ayuda, no dudes en escribirme. También puedes usar nuestro asistente IA inteligente.',
        senderId: adminUser.id,
        receiverId: sampleUsers[0].id,
        isRead: false,
      },
    });

    await prisma.message.create({
      data: {
        content: 'Hola, me encanta la nueva actualización. ¿Podrían agregar más películas de ciencia ficción como Blade Runner?',
        senderId: sampleUsers[0].id,
        receiverId: adminUser.id,
        isRead: false,
      },
    });

    await prisma.message.create({
      data: {
        content: '🤖 ¡Hola! Soy el asistente IA de 365GUTY. Veo que te interesan las películas de ciencia ficción. Te recomiendo "Exodus 2087", "Interstellar" y "The Matrix" de nuestro catálogo. ¿Te gustaría saber más sobre alguna de ellas?',
        senderId: adminUser.id,
        receiverId: sampleUsers[0].id,
        isRead: false,
      },
    });

    if (sampleUsers.length > 1) {
      await prisma.message.create({
        data: {
          content: 'El canal de deportes ESPN Sports Network no me está funcionando. ¿Pueden revisarlo?',
          senderId: sampleUsers[1].id,
          receiverId: adminUser.id,
          isRead: false,
        },
      });

      await prisma.message.create({
        data: {
          content: '🤖 He verificado el estado del canal ESPN Sports Network. El canal está funcionando correctamente. Asegúrate de tener una conexión a internet estable. Si el problema persiste, prueba refrescar la página o contacta al administrador.',
          senderId: adminUser.id,
          receiverId: sampleUsers[1].id,
          isRead: false,
        },
      });
    }

    if (sampleUsers.length > 2) {
      await prisma.message.create({
        data: {
          content: '¿Hay películas para niños? Mi familia necesita contenido familiar.',
          senderId: sampleUsers[2].id,
          receiverId: adminUser.id,
          isRead: false,
        },
      });

      await prisma.message.create({
        data: {
          content: '🤖 ¡Por supuesto! Tenemos una excelente selección de contenido familiar. Te recomiendo: "Aventuras Mágicas", "Toy Story 4", "Coco", "Finding Nemo" y "The Incredibles". También tenemos canales infantiles como "Discovery Kids Plus" y "Cartoon Network HD". ¡Perfecto para toda la familia!',
          senderId: adminUser.id,
          receiverId: sampleUsers[2].id,
          isRead: false,
        },
      });
    }
  }

  console.log('✅ Mensajes de ejemplo con IA creados');

  console.log('🎉 Seeding masivo completado exitosamente!');

  console.log('\n📊 RESUMEN COMPLETO DE CONTENIDO CREADO:');
  console.log(`👥 Usuarios creados: ${await prisma.user.count()} (1 admin + 12 usuarios de prueba)`);
  console.log(`🎬 Películas creadas: ${await prisma.movie.count()} (50+ títulos en múltiples géneros)`);
  console.log(`📺 Series creadas: ${await prisma.series.count()} (30+ series populares)`);
  console.log(`🎭 Temporadas creadas: ${await prisma.season.count()} (Breaking Bad, Stranger Things, Better Call Saul)`);
  console.log(`🎬 Episodios creados: ${await prisma.episode.count()} (con títulos, sinopsis y URLs individuales)`);
  console.log(`📡 Canales creados: ${await prisma.channel.count()} (20+ canales especializados)`);
  console.log(`💬 Mensajes creados: ${await prisma.message.count()} (incluye ejemplos con bot IA)`);
  
  console.log('\n🎯 GÉNEROS DE PELÍCULAS INCLUIDOS:');
  console.log('• Acción y Aventura • Terror y Horror • Romance • Ciencia Ficción');
  console.log('• Drama Histórico • Comedia • Suspense/Thriller • Animación Familiar');
  console.log('• Crimen/Noir • Fantasía • Clásicos del Cine');
  
  console.log('\n📺 GÉNEROS DE SERIES INCLUIDAS:');
  console.log('• Drama/Crimen (Breaking Bad, Narcos) • Sci-Fi/Horror (Stranger Things, Black Mirror)');
  console.log('• Fantasía (Game of Thrones, The Witcher) • Comedia (Friends, The Office)');
  console.log('• Suspense/Thriller (Ozark, True Detective) • Animación (Rick & Morty)');
  console.log('• Series Internacionales (Money Heist, Squid Game, Dark)');
  
  console.log('\n📺 TIPOS DE CANALES INCLUIDOS:');
  console.log('• Deportes (ESPN, Fox Sports, etc.) • Noticias (CNN, Breaking News)');
  console.log('• Infantil (Discovery Kids, Cartoon Network) • Documentales (Nat Geo, Discovery)');
  console.log('• Música (MTV, VH1) • Entretenimiento • Cultura • Cocina');
  
  console.log('\n🤖 FUNCIONALIDADES IMPLEMENTADAS:');
  console.log('• Chat en tiempo real con Server-Sent Events');
  console.log('• Bot inteligente con LLM API integrado');
  console.log('• Sistema de autenticación por contraseña');
  console.log('• Panel de administración completo');
  console.log('• Reproductor de video avanzado');
  
  console.log('\n🔐 CREDENCIALES DE ACCESO:');
  console.log('👑 ADMINISTRADOR: Contraseña -> 19801605');
  console.log('👤 Usuarios de prueba disponibles con diferentes contraseñas');
  console.log('💡 Tip: Usa el chat con IA para obtener recomendaciones personalizadas!');
  
  console.log('\n🚀 ¡365GUTY está listo para usar con contenido profesional!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

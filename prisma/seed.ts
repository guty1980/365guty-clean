import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Limpiar datos existentes
  await prisma.message.deleteMany()
  await prisma.episode.deleteMany()
  await prisma.season.deleteMany()
  await prisma.series.deleteMany()
  await prisma.movie.deleteMany()
  await prisma.channel.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  // Crear usuarios
  const adminPassword = await bcrypt.hash('19801605', 10)
  const demoPassword = await bcrypt.hash('123', 10)

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      password: adminPassword,
      isAdmin: true,
      allowedDevices: 3,
    },
  })

  const demoUser = await prisma.user.create({
    data: {
      name: 'Usuario Demo',
      password: demoPassword,
      isAdmin: false,
      allowedDevices: 1,
    },
  })

  // Crear películas de ejemplo
  const movies = await Promise.all([
    prisma.movie.create({
      data: {
        title: 'Acción Extrema',
        synopsis: 'Una película llena de acción y aventuras que te mantendrá al borde de tu asiento.',
        genre: 'Acción',
        year: 2023,
        duration: 120,
        ranking: 8.5,
        coverUrl: 'https://image.tmdb.org/t/p/w500/example1.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        isRecommended: true,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Comedia Familiar',
        synopsis: 'Una divertida comedia para toda la familia con momentos inolvidables.',
        genre: 'Comedia',
        year: 2022,
        duration: 95,
        ranking: 7.8,
        coverUrl: 'https://image.tmdb.org/t/p/w500/example2.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        isRecommended: false,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Drama Épico',
        synopsis: 'Un drama épico que explora las profundidades de la condición humana.',
        genre: 'Drama',
        year: 2023,
        duration: 150,
        ranking: 9.2,
        coverUrl: 'https://image.tmdb.org/t/p/w500/example3.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        isRecommended: true,
      },
    }),
  ])

  // Crear series de ejemplo
  const series1 = await prisma.series.create({
    data: {
      title: 'Serie de Misterio',
      synopsis: 'Una serie llena de misterios y suspense que te mantendrá adivinando hasta el final.',
      genre: 'Misterio',
      year: 2023,
      seasons: 2,
      episodes: 20,
      ranking: 8.7,
      coverUrl: 'https://image.tmdb.org/t/p/w500/series1.jpg',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      isRecommended: true,
    },
  })

  // Crear temporadas para la serie
  const season1 = await prisma.season.create({
    data: {
      seriesId: series1.id,
      number: 1,
      title: 'Primera Temporada',
      year: 2023,
      description: 'El misterio comienza en esta primera temporada llena de sorpresas.',
      totalEpisodes: 10,
    },
  })

  const season2 = await prisma.season.create({
    data: {
      seriesId: series1.id,
      number: 2,
      title: 'Segunda Temporada',
      year: 2023,
      description: 'La historia continúa con más misterios por resolver.',
      totalEpisodes: 10,
    },
  })

  // Crear episodios para la temporada 1
  for (let i = 1; i <= 5; i++) {
    await prisma.episode.create({
      data: {
        seasonId: season1.id,
        number: i,
        title: `Episodio ${i}`,
        synopsis: `En este episodio ${i}, los misterios se profundizan y nuevas pistas aparecen.`,
        duration: 45,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      },
    })
  }

  // Crear episodios para la temporada 2
  for (let i = 1; i <= 5; i++) {
    await prisma.episode.create({
      data: {
        seasonId: season2.id,
        number: i,
        title: `Episodio ${i} - Temporada 2`,
        synopsis: `La segunda temporada continúa con el episodio ${i}, revelando más secretos.`,
        duration: 45,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      },
    })
  }

  // Crear canales de ejemplo
  await Promise.all([
    prisma.channel.create({
      data: {
        name: 'Canal Deportes',
        coverUrl: 'https://example.com/sports-channel.jpg',
        m3u8Url: 'https://example.com/sports.m3u8',
      },
    }),
    prisma.channel.create({
      data: {
        name: 'Canal Noticias',
        coverUrl: 'https://example.com/news-channel.jpg',
        m3u8Url: 'https://example.com/news.m3u8',
      },
    }),
  ])

  console.log('✅ Seed completado exitosamente!')
  console.log(`👤 Usuario Admin creado: Administrador (password: 19801605)`)
  console.log(`👤 Usuario Demo creado: Usuario Demo (password: 123)`)
  console.log(`🎬 ${movies.length} películas creadas`)
  console.log(`📺 1 serie creada con 2 temporadas y 10 episodios`)
  console.log(`📡 2 canales creados`)
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
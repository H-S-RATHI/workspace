exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('content_categories').del();
  
  // Inserts seed entries
  await knex('content_categories').insert([
    {
      categoryId: knex.raw('gen_random_uuid()'),
      name: 'technology',
      displayName: 'Technology',
      description: 'Latest tech trends, gadgets, and innovations',
      color: '#3B82F6',
      sortOrder: 1,
      isActive: true,
      createdAt: new Date()
    },
    {
      categoryId: knex.raw('gen_random_uuid()'),
      name: 'fashion',
      displayName: 'Fashion',
      description: 'Style, trends, and fashion inspiration',
      color: '#EC4899',
      sortOrder: 2,
      isActive: true,
      createdAt: new Date()
    },
    {
      categoryId: knex.raw('gen_random_uuid()'),
      name: 'food',
      displayName: 'Food & Cooking',
      description: 'Recipes, restaurants, and culinary adventures',
      color: '#F59E0B',
      sortOrder: 3,
      isActive: true,
      createdAt: new Date()
    },
    {
      categoryId: knex.raw('gen_random_uuid()'),
      name: 'travel',
      displayName: 'Travel',
      description: 'Travel destinations, tips, and experiences',
      color: '#10B981',
      sortOrder: 4,
      isActive: true,
      createdAt: new Date()
    },
    {
      categoryId: knex.raw('gen_random_uuid()'),
      name: 'fitness',
      displayName: 'Fitness & Health',
      description: 'Workout routines, health tips, and wellness',
      color: '#EF4444',
      sortOrder: 5,
      isActive: true,
      createdAt: new Date()
    },
    {
      categoryId: knex.raw('gen_random_uuid()'),
      name: 'art',
      displayName: 'Art & Design',
      description: 'Creative works, design inspiration, and artistic expression',
      color: '#8B5CF6',
      sortOrder: 6,
      isActive: true,
      createdAt: new Date()
    },
    {
      categoryId: knex.raw('gen_random_uuid()'),
      name: 'music',
      displayName: 'Music',
      description: 'Music discovery, concerts, and audio content',
      color: '#06B6D4',
      sortOrder: 7,
      isActive: true,
      createdAt: new Date()
    },
    {
      categoryId: knex.raw('gen_random_uuid()'),
      name: 'gaming',
      displayName: 'Gaming',
      description: 'Video games, esports, and gaming culture',
      color: '#84CC16',
      sortOrder: 8,
      isActive: true,
      createdAt: new Date()
    },
    {
      categoryId: knex.raw('gen_random_uuid()'),
      name: 'business',
      displayName: 'Business',
      description: 'Entrepreneurship, startups, and business insights',
      color: '#64748B',
      sortOrder: 9,
      isActive: true,
      createdAt: new Date()
    },
    {
      categoryId: knex.raw('gen_random_uuid()'),
      name: 'education',
      displayName: 'Education',
      description: 'Learning resources, tutorials, and educational content',
      color: '#0EA5E9',
      sortOrder: 10,
      isActive: true,
      createdAt: new Date()
    }
  ]);
};
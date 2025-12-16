/**
 * Seed Data Script for Glutton4Gainz
 * Node.js version - easier to run if you have Node.js installed
 * 
 * Usage:
 *   node scripts/seed-data.js
 * 
 * Or with npm:
 *   npm run seed
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedData() {
  console.log('========================================');
  console.log('G4G Seed Data Script (Node.js)');
  console.log('========================================');
  console.log('');

  try {
    // Step 1: Find admin user
    console.log('📋 Step 1: Finding admin user...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching users:', authError);
      return;
    }

    const adminUser = authUsers.users.find(u => u.email === 'rajeshsunny@gmail.com');
    
    if (!adminUser) {
      console.log('⚠️  Warning: User rajeshsunny@gmail.com not found');
      console.log('   Please ensure the user has signed up first');
    } else {
      console.log('✅ Found admin user:', adminUser.email);
      console.log('   User ID:', adminUser.id);
    }

    // Step 2: Update/Insert admin profile
    if (adminUser) {
      console.log('');
      console.log('📋 Step 2: Updating admin profile...');
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: adminUser.id,
          email: 'rajeshsunny@gmail.com',
          role: 'admin',
          tier: '.50 Cal',
          xp: 10000,
          current_streak: 100,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('❌ Error updating profile:', profileError);
      } else {
        console.log('✅ Admin profile configured');
      }
    }

    // Step 3: Deactivate all existing briefings
    console.log('');
    console.log('📋 Step 3: Managing daily briefings...');
    await supabase
      .from('daily_briefings')
      .update({ active: false })
      .eq('active', true);

    // Step 4: Create new active briefing
    const { data: briefing, error: briefingError } = await supabase
      .from('daily_briefings')
      .insert({
        content: 'Soldiers, today is your day to dominate. Every rep counts, every set matters. Push beyond your limits and prove to yourself what you\'re truly capable of. The mission starts now. Lock and load!',
        active: true,
        created_by: adminUser?.id || null,
      })
      .select()
      .single();

    if (briefingError) {
      console.error('❌ Error creating briefing:', briefingError);
    } else {
      console.log('✅ Active briefing created');
    }

    // Step 5: Seed workouts (if needed)
    console.log('');
    console.log('📋 Step 4: Seeding workouts...');
    const today = new Date().toISOString().split('T')[0];
    
    const workouts = [
      {
        tier: '.223',
        title: 'BASIC RECON',
        description: 'Foundation workout focusing on bodyweight basics. Perfect for building base strength and form.',
        video_url: 'dQw4w9WgXcQ',
        scheduled_date: today,
        sets_reps: [
          { exercise: 'Pushups', reps: '3 sets x 8-10 reps' },
          { exercise: 'Bodyweight Squats', reps: '3 sets x 15 reps' },
          { exercise: 'Plank Hold', reps: '3 sets x 30 seconds' },
          { exercise: 'Jumping Jacks', reps: '2 sets x 20 reps' },
        ],
      },
      {
        tier: '.556',
        title: 'STANDARD PATROL',
        description: 'Intermediate intensity circuit. Focus on controlled movement and breathing.',
        video_url: 'dQw4w9WgXcQ',
        scheduled_date: today,
        sets_reps: [
          { exercise: 'Pushups', reps: '4 sets x 15-20 reps' },
          { exercise: 'Jump Squats', reps: '4 sets x 12 reps' },
          { exercise: 'Mountain Climbers', reps: '4 sets x 20 reps' },
          { exercise: 'Plank Hold', reps: '3 sets x 45 seconds' },
          { exercise: 'Burpees', reps: '3 sets x 10 reps' },
        ],
      },
      {
        tier: '.762',
        title: 'ASSAULT PROTOCOL',
        description: 'High-intensity advanced workout. Push beyond your limits with explosive movements.',
        video_url: 'dQw4w9WgXcQ',
        scheduled_date: today,
        sets_reps: [
          { exercise: 'Explosive Pushups', reps: '5 sets x 15 reps' },
          { exercise: 'Pistol Squats (each leg)', reps: '4 sets x 8 reps' },
          { exercise: 'Burpee Box Jumps', reps: '4 sets x 12 reps' },
          { exercise: 'Plank to Pike', reps: '4 sets x 15 reps' },
          { exercise: 'Mountain Climbers', reps: '4 sets x 30 reps' },
          { exercise: 'Diamond Pushups', reps: '3 sets x 12 reps' },
        ],
      },
      {
        tier: '.50 Cal',
        title: 'SPECIAL OPS MISSION',
        description: 'Elite-level workout. Maximum intensity, precision execution. This is where warriors are forged.',
        video_url: 'dQw4w9WgXcQ',
        scheduled_date: today,
        sets_reps: [
          { exercise: 'One-Arm Pushups (each arm)', reps: '5 sets x 10 reps' },
          { exercise: 'Pistol Squats (each leg)', reps: '5 sets x 12 reps' },
          { exercise: 'Burpee Muscle-Ups', reps: '5 sets x 8 reps' },
          { exercise: 'L-Sit Hold', reps: '4 sets x 30 seconds' },
          { exercise: 'Planche Pushups', reps: '4 sets x 8 reps' },
          { exercise: 'Sprint Intervals', reps: '10 rounds x 30 seconds sprint, 30 seconds rest' },
        ],
      },
    ];

    for (const workout of workouts) {
      const { error } = await supabase
        .from('workouts')
        .upsert(workout, {
          onConflict: 'tier,scheduled_date',
        });

      if (error && error.code !== '23505') { // Ignore unique constraint errors
        console.error(`❌ Error seeding workout ${workout.tier}:`, error.message);
      }
    }
    console.log('✅ Workouts seeded (4 tiers)');

    // Step 6: Seed recipes (if needed)
    console.log('');
    console.log('📋 Step 5: Seeding recipes...');
    const recipes = [
      {
        title: 'TACTICAL PROTEIN BOWL',
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
        calories: 520,
        protein: 45,
        carbs: 55,
        fat: 12,
        instructions: '1. Grill 6oz chicken breast with military precision\n2. Cook 1 cup brown rice\n3. Steam broccoli and carrots\n4. Assemble: rice base, chicken on top, vegetables on the flank\n5. Drizzle with low-sodium soy sauce\n6. Deploy hot sauce for tactical advantage (optional)\n\nMACROS PER SERVING:\nCalories: 520 | Protein: 45g | Carbs: 55g | Fat: 12g',
      },
      {
        title: 'COMBAT OATS',
        image_url: 'https://images.unsplash.com/photo-1517673400267-0251440f9a88',
        calories: 380,
        protein: 18,
        carbs: 62,
        fat: 8,
        instructions: '1. Mix 1 cup oats with 1.5 cups water or almond milk\n2. Microwave 2-3 minutes or cook on stove\n3. Stir in 1 scoop protein powder (vanilla recommended)\n4. Top with 1 banana (sliced), berries, and 1 tbsp almond butter\n5. Optional: cinnamon, honey\n\nMACROS PER SERVING:\nCalories: 380 | Protein: 18g | Carbs: 62g | Fat: 8g',
      },
      {
        title: 'RANGER BEEF STIR-FRY',
        image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b',
        calories: 445,
        protein: 38,
        carbs: 42,
        fat: 15,
        instructions: '1. Slice 6oz lean beef into strips\n2. Heat wok with 1 tbsp olive oil\n3. Stir-fry beef on high heat (2-3 minutes)\n4. Add bell peppers, snap peas, onions\n5. Season with ginger, garlic, low-sodium soy sauce\n6. Serve over 1 cup quinoa or rice noodles\n\nMACROS PER SERVING:\nCalories: 445 | Protein: 38g | Carbs: 42g | Fat: 15g',
      },
      {
        title: 'SPECIAL FORCES SALMON',
        image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288',
        calories: 485,
        protein: 42,
        carbs: 35,
        fat: 20,
        instructions: '1. Season 6oz salmon fillet with lemon, dill, salt, pepper\n2. Bake at 400°F for 12-15 minutes\n3. Roast sweet potato (1 medium) until tender\n4. Steam asparagus with garlic\n5. Plate with precision: salmon center, sweet potato and asparagus flanking\n\nMACROS PER SERVING:\nCalories: 485 | Protein: 42g | Carbs: 35g | Fat: 20g',
      },
      {
        title: 'RECON RECOVERY SHAKE',
        image_url: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8',
        calories: 340,
        protein: 30,
        carbs: 45,
        fat: 5,
        instructions: '1. Blend 1 scoop protein powder (chocolate)\n2. Add 1 frozen banana\n3. Add 1 cup almond milk\n4. Add handful of spinach (trust the process)\n5. Add 1 tbsp peanut butter\n6. Blend until smooth\n7. Consume within 30 minutes post-mission\n\nMACROS PER SERVING:\nCalories: 340 | Protein: 30g | Carbs: 45g | Fat: 5g',
      },
      {
        title: 'INFANTRY EGGS',
        image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8',
        calories: 295,
        protein: 24,
        carbs: 18,
        fat: 15,
        instructions: '1. Scramble 3 whole eggs + 2 egg whites\n2. Add diced tomatoes, spinach, onions to pan\n3. Cook until eggs are just set\n4. Serve with 1 slice whole wheat toast\n5. Optional: hot sauce for combat readiness\n\nMACROS PER SERVING:\nCalories: 295 | Protein: 24g | Carbs: 18g | Fat: 15g',
      },
      {
        title: 'WARRIOR WRAP',
        image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f',
        calories: 420,
        protein: 35,
        carbs: 48,
        fat: 10,
        instructions: '1. Grill 5oz chicken breast\n2. Slice into strips\n3. Load whole wheat tortilla with:\n   - Grilled chicken\n   - Lettuce, tomatoes\n   - Light Greek yogurt (instead of mayo)\n   - Shredded cheese (1oz)\n   - Hot sauce\n4. Wrap tight and deploy\n\nMACROS PER SERVING:\nCalories: 420 | Protein: 35g | Carbs: 48g | Fat: 10g',
      },
      {
        title: 'COMMANDO CHILI',
        image_url: 'https://images.unsplash.com/photo-1583114867730-8cd69dfc8d7e',
        calories: 390,
        protein: 32,
        carbs: 42,
        fat: 10,
        instructions: '1. Brown 6oz lean ground turkey\n2. Add canned black beans, kidney beans (1 cup total)\n3. Add diced tomatoes, tomato paste\n4. Season with chili powder, cumin, garlic\n5. Simmer 20-30 minutes\n6. Serve hot, optionally with a side of tactical rice\n\nMACROS PER SERVING:\nCalories: 390 | Protein: 32g | Carbs: 42g | Fat: 10g',
      },
    ];

    for (const recipe of recipes) {
      const { error } = await supabase
        .from('recipes')
        .upsert(recipe, {
          onConflict: 'title',
        });

      if (error && error.code !== '23505') {
        console.error(`❌ Error seeding recipe ${recipe.title}:`, error.message);
      }
    }
    console.log('✅ Recipes seeded (8 meals)');

    // Success message
    console.log('');
    console.log('========================================');
    console.log('✅ SEED DATA DEPLOYED SUCCESSFULLY');
    console.log('========================================');
    console.log('');
    if (adminUser) {
      console.log('Admin User: rajeshsunny@gmail.com ✓');
      console.log('User ID:', adminUser.id);
    } else {
      console.log('Admin User: NOT FOUND (user must sign up first)');
    }
    console.log('Active Briefings: 1');
    console.log('Workouts: 4 missions (1 per tier for today)');
    console.log('Recipes: 8 tactical meals');
    console.log('');
    console.log('Next Steps:');
    console.log('1. Log in as rajeshsunny@gmail.com');
    console.log('2. Admin will be redirected to /command (not /dashboard)');
    console.log('3. Motivational Corner visible on /command page');
    console.log('4. Visit /barracks/content/briefing to manage briefings');
    console.log('');
    console.log('Note:');
    console.log('- Admins → /command page');
    console.log('- Coaches → /barracks page');
    console.log('- Recruits/Soldiers → /dashboard page');
    console.log('========================================');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedData();


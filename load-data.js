const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://tqxtkqzswhcyhopkhjam.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxeHRrcXpzd2hjeWhvcGtoamFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDkzNTQyMywiZXhwIjoyMDg2NTExNDIzfQ.qbqdjRB0oL-gr_Bi8VL5PLy8qj1I79LsXIfgR4GLmRk'
);

(async () => {
  console.log('Loading SQL...');
  const sql = fs.readFileSync('./scripts/seed-data.sql', 'utf8');
  
  console.log('Executing...');
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  
  console.log('✅ Data loaded successfully!');
})();

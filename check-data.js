const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://tqxtkqzswhcyhopkhjam.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxeHRrcXpzd2hjeWhvcGtoamFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDkzNTQyMywiZXhwIjoyMDg2NTExNDIzfQ.qbqdjRB0oL-gr_Bi8VL5PLy8qj1I79LsXIfgR4GLmRk'
);

(async () => {
  const { data: battles, error: battlesError } = await supabase.from('battles').select('count');
  const { data: contacts, error: contactsError } = await supabase.from('contacts').select('count');
  
  console.log('Battles:', battlesError ? `ERROR: ${battlesError.message}` : `${battles[0].count} rows`);
  console.log('Contacts:', contactsError ? `ERROR: ${contactsError.message}` : `${contacts[0].count} rows`);
})();

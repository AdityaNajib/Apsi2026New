async function testLogin() {
  const testCredentials = [
    { email: 'budi@admin.uns.ac.id', password: 'password123', role: 'ADMIN' },
    { email: 'wakhidjauhari@kaprodi.uns.ac.id', password: 'password123', role: 'KAPRODI' },
    { email: 'joko.widodo@staff.uns.ac.id', password: 'password123', role: 'DOSEN' },
    { email: 'aditya@student.uns.ac.id', password: 'password123', role: 'MAHASISWA' },
  ];

  console.log('🔐 Testing Login API...\n');

  for (const cred of testCredentials) {
    console.log(`Testing: ${cred.email}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: cred.email,
          password: cred.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ SUCCESS - ${cred.role}`);
        console.log(`   Redirect: ${data.redirectPath}`);
        console.log(`   Name: ${data.user.name}\n`);
      } else {
        console.log(`❌ FAILED - Status: ${response.status}`);
        console.log(`   Error: ${data.error}\n`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}\n`);
    }
  }
}

testLogin();

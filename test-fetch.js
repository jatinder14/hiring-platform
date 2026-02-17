async function testApi() {
    try {
        const res = await fetch('http://localhost:3000/api/jobs');
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Data count:', Array.isArray(data) ? data.length : 'Not an array');
        if (!Array.isArray(data)) console.log('Response body:', data);
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

testApi();

import { createServer } from 'vite';

async function startClient() {
  const server = await createServer({
    server: {
      port: 3000,
      strictPort: true,
    },
  });

  await server.listen();
  console.log('🚀 Frontend dev server running on http://localhost:3000');
}

startClient().catch((err) => {
  console.error(err);
  process.exit(1);
});

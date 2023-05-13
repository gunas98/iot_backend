app.get('/example', (req, res, next) => {
    try {
      // Some code that throws an error
    } catch (err) {
      next(err);
    }
  });
  
  app.use(logMiddleware());
  
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
  });
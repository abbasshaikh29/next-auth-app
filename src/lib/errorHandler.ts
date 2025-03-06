function errorHandler(err: any, req: any, res: any, next: any) {
  console.error("Custom error handler triggered:", err);
  next(err);
}

export default errorHandler;

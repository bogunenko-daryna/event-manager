export const randomDelay = () => {
  const delay = 200 + Math.random() * 300;

  return new Promise((resolve) => {
    window.setTimeout(resolve, delay);
  });
};

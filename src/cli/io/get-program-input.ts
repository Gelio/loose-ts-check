import { createInterface } from 'readline';

export const getProgramInput = () =>
  new Promise<string[]>((resolve) => {
    const programInput: string[] = [];
    const rl = createInterface(process.stdin);

    rl.on('line', (line) => {
      programInput.push(line);
    });

    rl.once('close', () => {
      resolve(programInput);
    });
  });

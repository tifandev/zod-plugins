import { z } from 'zod';
import { generateMock } from './zod-mock';

describe('zod-mock', () => {
  it('should generate a mock object using faker', () => {
    const schema = z.object({
      uid: z.string().nonempty(),
      theme: z.enum([`light`, `dark`]),
      name: z.string(),
      firstName: z.string(),
      email: z.string().email().optional(),
      phoneNumber: z.string().min(10).optional(),
      avatar: z.string().url().optional(),
      jobTitle: z.string().optional(),
      otherUserEmails: z.array(z.string().email()),
      stringArrays: z.array(z.string()),
      stringLength: z.string().transform((val) => val.length),
      numberCount: z.number().transform((item) => `total value = ${item}`),
      age: z.number().min(18).max(120),
    });

    const mockData = generateMock(schema); //?

    expect(typeof mockData.uid).toEqual('string');
    expect(
      mockData.theme === 'light' || mockData.theme === 'dark'
    ).toBeTruthy();
    expect(mockData.email).toEqual(expect.stringMatching(/\S+@\S+\.\S+/));
    expect(mockData.avatar).toEqual(
      expect.stringMatching(
        /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i
      )
    );
    expect(typeof mockData.phoneNumber).toEqual('string');
    expect(typeof mockData.jobTitle).toEqual('string');
    expect(typeof mockData.stringLength).toEqual('number');
    expect(typeof mockData.numberCount).toEqual('string');
    expect(mockData.age > 18 && mockData.age < 120).toBeTruthy();
  });

  it('should generate mock data of the appropriate type when the field names overlap Faker properties that are not valid functions', () => {
    const schema = z.object({
      // the following fields represent non function properties in Faker
      lorem: z.string(),
      phone_number: z.string().min(10).optional(),

      // 'shuffle', located at `faker.helpers.shuffle`, is a function, but does not
      // produce the appropriate return type to match `fakerFunction`
      shuffle: z.string(),

      // 'seed', located at `faker.mersenne.seed` is a function but will throw an error
      // if it is called with the wrong parameter
      seed: z.string()
    });

    const mockData = generateMock(schema);
    expect(typeof mockData.lorem).toEqual('string');
    expect(typeof mockData.phone_number).toEqual('string');
    expect(typeof mockData.shuffle).toEqual('string');
    expect(typeof mockData.seed).toEqual('string');
  });

  it('Should manually mock string key names to set values', () => {
    const schema = z.object({
      uid: z.string().nonempty(),
      theme: z.enum([`light`, `dark`]),
      locked: z.string(),
      email: z.string().email(),
      camelCase: z.string()
    });

    const stringMap = {
      locked: () => `value set`,
      email: () => `not a email anymore`,
      camelCase: () => 'Exact case works',
    }

    const mockData = generateMock(schema, { stringMap }); //?

    expect(mockData.uid).toEqual(
      expect.stringMatching(
        /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
      )
    );
    expect(mockData.theme).toEqual(expect.stringMatching(/light|dark/));
    expect(mockData.locked).toEqual('value set');
    expect(mockData.email).toEqual(
      expect.stringMatching('not a email anymore')
    );
    expect(mockData.camelCase).toEqual(stringMap.camelCase())

    return;
  });
});

import 'jest';
import {
  QaseApi,
  ProjectsApi,
  CasesApi,
  ResultsApi,
  RunsApi,
  AttachmentsApi,
  PlansApi,
  SuitesApi,
  MilestonesApi,
  SharedStepsApi,
  DefectsApi,
  CustomFieldsApi,
  AuthorsApi,
} from '../src';

jest.mock('../src/generated/api');

describe('Client', () => {
  const ProjectsApiMock = jest.mocked(ProjectsApi);
  const CasesApiMock = jest.mocked(CasesApi);
  const ResultsApiMock = jest.mocked(ResultsApi);
  const RunsApiMock = jest.mocked(RunsApi);
  const AttachmentsApiMock = jest.mocked(AttachmentsApi);
  const PlansApiMock = jest.mocked(PlansApi);
  const SuitesApiMock = jest.mocked(SuitesApi);
  const MilestonesApiMock = jest.mocked(MilestonesApi);
  const SharedStepsApiMock = jest.mocked(SharedStepsApi);
  const DefectsApiMock = jest.mocked(DefectsApi);
  const CustomFieldsApiMock = jest.mocked(CustomFieldsApi);
  const AuthorsApiMock = jest.mocked(AuthorsApi);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Init client', () => {
    const apiToken = '123';

    const headers = {
      'X-Foo': 'Foo',
      'X-Bar': 'Bar',
    };

    const FormData = jest.fn();

    new QaseApi({
      apiToken,
      headers,
      formDataCtor: FormData,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const expectedConfiguration: NonNullable<unknown> = expect.objectContaining(
      {
        apiKey: apiToken,
        formDataCtor: FormData,
      },
    );

    const expectedHeaders: unknown = expect.objectContaining(headers);

    expect(ProjectsApiMock.mock.calls[0]?.[0]).toMatchObject(
      expectedConfiguration,
    );
    expect(ProjectsApiMock.mock.calls[0]?.[1]).toBeUndefined();
    expect(ProjectsApiMock.mock.calls[0]?.[2]).toHaveProperty(
      'defaults.headers',
      expectedHeaders,
    );

    expect(CasesApiMock.mock.calls[0]?.[0]).toMatchObject(
      expectedConfiguration,
    );
    expect(CasesApiMock.mock.calls[0]?.[1]).toBeUndefined();
    expect(CasesApiMock.mock.calls[0]?.[2]).toHaveProperty(
      'defaults.headers',
      expectedHeaders,
    );

    expect(ResultsApiMock.mock.calls[0]?.[0]).toMatchObject(
      expectedConfiguration,
    );
    expect(ResultsApiMock.mock.calls[0]?.[1]).toBeUndefined();
    expect(ResultsApiMock.mock.calls[0]?.[2]).toHaveProperty(
      'defaults.headers',
      expectedHeaders,
    );

    expect(RunsApiMock.mock.calls[0]?.[0]).toMatchObject(expectedConfiguration);
    expect(RunsApiMock.mock.calls[0]?.[1]).toBeUndefined();
    expect(RunsApiMock.mock.calls[0]?.[2]).toHaveProperty(
      'defaults.headers',
      expectedHeaders,
    );

    expect(AttachmentsApiMock.mock.calls[0]?.[0]).toMatchObject(
      expectedConfiguration,
    );
    expect(AttachmentsApiMock.mock.calls[0]?.[1]).toBeUndefined();
    expect(AttachmentsApiMock.mock.calls[0]?.[2]).toHaveProperty(
      'defaults.headers',
      expectedHeaders,
    );

    expect(PlansApiMock.mock.calls[0]?.[0]).toMatchObject(
      expectedConfiguration,
    );
    expect(PlansApiMock.mock.calls[0]?.[1]).toBeUndefined();
    expect(PlansApiMock.mock.calls[0]?.[2]).toHaveProperty(
      'defaults.headers',
      expectedHeaders,
    );

    expect(SuitesApiMock.mock.calls[0]?.[0]).toMatchObject(
      expectedConfiguration,
    );
    expect(SuitesApiMock.mock.calls[0]?.[1]).toBeUndefined();
    expect(SuitesApiMock.mock.calls[0]?.[2]).toHaveProperty(
      'defaults.headers',
      expectedHeaders,
    );

    expect(MilestonesApiMock.mock.calls[0]?.[0]).toMatchObject(
      expectedConfiguration,
    );
    expect(MilestonesApiMock.mock.calls[0]?.[1]).toBeUndefined();
    expect(MilestonesApiMock.mock.calls[0]?.[2]).toHaveProperty(
      'defaults.headers',
      expectedHeaders,
    );

    expect(SharedStepsApiMock.mock.calls[0]?.[0]).toMatchObject(
      expectedConfiguration,
    );
    expect(SharedStepsApiMock.mock.calls[0]?.[1]).toBeUndefined();
    expect(SharedStepsApiMock.mock.calls[0]?.[2]).toHaveProperty(
      'defaults.headers',
      expectedHeaders,
    );

    expect(DefectsApiMock.mock.calls[0]?.[0]).toMatchObject(
      expectedConfiguration,
    );
    expect(DefectsApiMock.mock.calls[0]?.[1]).toBeUndefined();
    expect(DefectsApiMock.mock.calls[0]?.[2]).toHaveProperty(
      'defaults.headers',
      expectedHeaders,
    );

    expect(CustomFieldsApiMock.mock.calls[0]?.[0]).toMatchObject(
      expectedConfiguration,
    );
    expect(CustomFieldsApiMock.mock.calls[0]?.[1]).toBeUndefined();
    expect(CustomFieldsApiMock.mock.calls[0]?.[2]).toHaveProperty(
      'defaults.headers',
      expectedHeaders,
    );

    expect(AuthorsApiMock.mock.calls[0]?.[0]).toMatchObject(
      expectedConfiguration,
    );
    expect(AuthorsApiMock.mock.calls[0]?.[1]).toBeUndefined();
    expect(AuthorsApiMock.mock.calls[0]?.[2]).toHaveProperty(
      'defaults.headers',
      expectedHeaders,
    );
  });
});

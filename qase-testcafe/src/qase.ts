// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class qase {
  private static _qaseID = '';
  private static _qaseTitle = '';
  private static _qaseFields = '';
  private static _qaseParameters = '';
  private static _qaseGroupParameters = '';
  private static _qaseIgnore = '';

  /**
   * Set a Qase ID for the test case
   * Don't forget to call `create` method after setting all the necessary parameters
   * @param {number | number[]} value
   * @example
   * const q = qase.id(1).create();
   * test.meta(q)('Test case title', async t => { ... });
   * or
   * test.meta({userField: 123, ...q})('Test case title', async t => { ... });
   */
  public static id = (value: number | number[]) => {
    this._qaseID = Array.isArray(value) ? value.join(',') : String(value);
    return this;
  };

  /**
   * Set a title for the test case
   * Don't forget to call `create` method after setting all the necessary parameters
   * @param {string} value
   * @example
   * const q = qase.title('Test case title').create();
   * test.meta(q)('Test case title', async t => { ... });
   * or
   * test.meta({userField: 123, ...q})('Test case title', async t => { ... });
   */
  public static title = (value: string) => {
    this._qaseTitle = value;
    return this;
  };

  /**
   * Set a fields for the test case
   * Don't forget to call `create` method after setting all the necessary parameters
   * @param {Record<string, string>} values
   * @example
   * const q = qase.fields({ 'severity': 'high', 'priority': 'medium' }).create();
   * test.meta(q)('Test case title', async t => { ... });
   * or
   * test.meta({userField: 123, ...q})('Test case title', async t => { ... });
   */
  public static fields = (values: Record<string, string>) => {
    this._qaseFields = this.toNormalizeRecord(values);
    return this;
  };

  /**
   * Set a parameters for the test case
   * Don't forget to call `create` method after setting all the necessary parameters
   * @param {Record<string, string>} values
   * @example
   * const q = qase.parameters({ 'severity': 'high', 'priority': 'medium' }).create();
   * test.meta(q)('Test case title', async t => { ... });
   * or
   * test.meta({userField: 123, ...q})('Test case title', async t => { ... });
   */
  public static parameters = (values: Record<string, string>) => {
    this._qaseParameters = this.toNormalizeRecord(values);
    return this;
  };

  /**
   * Set a group parameters for the test case
   * Don't forget to call `create` method after setting all the necessary parameters
   * @param {Record<string, string>} values
   * @example
   * const q = qase.groupParameters({ 'severity': 'high', 'priority': 'medium' }).create();
   * test.meta(q)('Test case title', async t => { ... });
   * or
   * test.meta({userField: 123, ...q})('Test case title', async t => { ... });
   */
  public static groupParameters = (values: Record<string, string>) => {
    this._qaseGroupParameters = this.toNormalizeRecord(values);
    return this;
  };

  /**
   * Set a ignore flag for the test case
   * Don't forget to call `create` method after setting all the necessary parameters
   * @example
   * const q = qase.ignore().create();
   * test.meta(q)('Test case title', async t => { ... });
   * or
   * test.meta({userField: 123, ...q})('Test case title', async t => { ... });
   */
  public static ignore = () => {
    this._qaseIgnore = 'true';
    return this;
  };

  /**
   * Create a Qase metadata
   * Call this method after setting all the necessary parameters
   * @example
   * const q = qase.id(1).title('Test case title').fields({ 'severity': 'high', 'priority': 'medium' }).create();
   * test.meta(q)('Test case title', async t => { ... });
   * or
   * test.meta({userField: 123, ...q})('Test case title', async t => { ... });
   */
  public static create = () => {
    const meta = {
      QaseID: this._qaseID,
      QaseTitle: this._qaseTitle,
      QaseFields: this._qaseFields,
      QaseParameters: this._qaseParameters,
      QaseGroupParameters: this._qaseGroupParameters,
      QaseIgnore: this._qaseIgnore,
    };

    this._qaseID = '';
    this._qaseTitle = '';
    this._qaseFields = '';
    this._qaseParameters = '';
    this._qaseGroupParameters = '';
    this._qaseIgnore = '';

    return meta;
  };

  private static toNormalizeRecord = (record: Record<string, string>) => {
    const stringRecord: Record<string, string> = {};
    for (const [key, value] of Object.entries(record)) {
      stringRecord[String(key)] = String(value);
    }
    return JSON.stringify(stringRecord);
  };
}

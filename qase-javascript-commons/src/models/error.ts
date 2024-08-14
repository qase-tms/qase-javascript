export class CompoundError {
  message: string | undefined;
  stacktrace: string | undefined;

  constructor() {
    this.message = 'CompoundError: One or more errors occurred. ---\n';
  }

  addMessage(message: string): void {
    this.message += `${message}\n--- End of error message ---\n`;
  }

  addStacktrace(stacktrace: string): void {
    if (!this.stacktrace) {
      this.stacktrace = `${indentAll(stacktrace)}\n--- End of stack trace ---\n`;
      return
    }

    this.stacktrace += `${indentAll(stacktrace)}\n--- End of stack trace ---\n`;
  }
}

function indentAll(lines: string) {
  return lines.split('\n').map(x => '    ' + x).join('\n');
}

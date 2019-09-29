import { expect } from 'chai';
import { spy } from 'sinon';

import { Template } from '../../src/utils/Template';

describe('template', () => {
  it('should invoke render delegate', () => {
    const templateSpy: HandlebarsTemplateDelegate = spy();
    const template = new Template({
      template: templateSpy,
    });

    template.render({});
    expect(templateSpy).to.have.callCount(1);
  });
});

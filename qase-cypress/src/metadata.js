import { MetadataManager } from './metadata/manager';

module.exports = function(on) {
  on('task', {
    qaseTitle(value) {
      MetadataManager.setTitle(value);
      return null;
    },
  });

  on('task', {
    qaseFields(value) {
      MetadataManager.setFields(value);
      return null;
    },
  });

  on('task', {
    qaseIgnore() {
      MetadataManager.setIgnore();
      return null;
    },
  });

  on('task', {
    qaseParameters(value) {
      MetadataManager.setParameters(value);
      return null;
    },
  });

  on('task', {
    qaseGroupParameters(value) {
      MetadataManager.setGroupParams(value);
      return null;
    },
  });

  on('task', {
    qaseSuite(value) {
      MetadataManager.setSuite(value);
      return null;
    },
  });

  on('task', {
    qaseComment(value) {
      MetadataManager.setComment(value);
      return null;
    },
  });

  on('task', {
    qaseStepStart(value) {
      MetadataManager.addStepStart(value);
      return null;
    },
  });

  on('task', {
    qaseStepEnd(value) {
      MetadataManager.addStepEnd(value);
      return null;
    },
  });

  on('task', {
    qaseAttach(value) {
      MetadataManager.addAttach(value);
      return null;
    },
  });
};

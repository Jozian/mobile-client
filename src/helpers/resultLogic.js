export function generateEmptyResponse(data) {
  const oParser = new DOMParser();
  const doc = oParser.parseFromString(data, 'text/xml');
  // FIXME: NS drop
  return (new XMLSerializer()).serializeToString(
    doc.querySelector('model instance data')
  ).replace('<data xmlns="http://www.w3.org/2002/xforms"', '<data');
}

export function convertXMLToSurvey(data) {
  const oParser = new DOMParser();
  const doc = oParser.parseFromString(data, 'text/xml');

  function translate(key) {
    if (!key) {
      return '';
    }

    const id = key.match(/jr:itext\(['"]([^'"]+)['"]\)/)[1];
    if (!id) {
      return '';
    }

    return doc.querySelector(`itext translation[lang="eng"] text[id="${id}"] value`).textContent;
  }


  const result = {
    title: doc.querySelector('head > title').textContent,
    categories: [],
  };
  const groups = Array.from(doc.querySelectorAll('body > group'));
  groups.forEach(group => {
    const groupRef = group.getAttribute('ref');
    const groupBind = doc.querySelector(`bind[nodeset="${groupRef}"]`);

    const convertedGroup = {
      title: '',
      questions: [],
      id: groupRef.split('/').slice(-1).pop(),
      relevant: groupBind.getAttribute('relevant'),
    };

    Array.from(group.childNodes).forEach(node => {
      if (node.nodeType === node.TEXT_NODE) { return; }
      if (node.nodeName === 'label') {
        convertedGroup.title = translate(node.getAttribute('ref'));
        return;
      }
      const label = translate(node.querySelector('label').getAttribute('ref'));
      const ref = node.getAttribute('ref');
      const bind = doc.querySelector(`bind[nodeset="${ref}"]`);
      const id = ref.split('/').slice(-1).pop();
      const defaultValue = doc.querySelector(`model ${id}`).textContent;
      const items = Array.from(node.querySelectorAll('item')).map(item => ({
        label: translate(item.querySelector('label').getAttribute('ref')),
        value: item.querySelector('value').textContent,
      }));

      const question = {
        label,
        type: bind.getAttribute('type'),
        constraint: bind.getAttribute('constraint'),
        relevant: bind.getAttribute('relevant'),
        required: bind.getAttribute('required') === 'true()',
        id,

        defaultValue,
      };

      if (items.length) {
        question.items = items;
      }

      if (question.type === 'binary') {
        question.mediatype = node.getAttribute('mediatype');
      }

      convertedGroup.questions.push(question);
    });

    result.categories.push(convertedGroup);
  });

  return result;
}

export function gatherValues(data) {
  const oParser = new DOMParser();
  const result = oParser.parseFromString(data, 'text/xml');
  const root = result.querySelector('data');
  const results = {};
  Array.from(root.childNodes).forEach(node => {
    if (node.nodeType === node.TEXT_NODE) { return; }
    Array.from(node.childNodes).forEach(childNode => {
      if (childNode.nodeType === childNode.TEXT_NODE) { return; }
      results[childNode.nodeName] = childNode.textContent;
    });
  });
  return results;
}

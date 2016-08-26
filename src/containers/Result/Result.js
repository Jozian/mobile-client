import React, { Component, PropTypes } from 'react';
const { object, string, func, bool } = PropTypes;
import { connect } from 'react-redux';
import { memoize } from 'lodash';
import { routeActions } from 'react-router-redux';

import { confirm } from 'helpers/platform/ui';

import { saveResult } from 'redux/modules/activeResult';
import { requestSubmit } from 'redux/modules/results';

import { Header } from 'components';
import widgets from 'components/widgets';

import styles from './Result.scss';

const getRequiredQuestions = (structure) => {
  const q = [];
  structure.categories.forEach(category =>
    category.questions.forEach(question => {
      if (question.required) {
        q.push(question);
      }
    })
  );
  return q;
};


class Result extends Component {

  static propTypes = {
    structure: object.isRequired,
    saveResult: func.isRequired,
    id: string.isRequired,
    name: string.isRequired,
    raw: string.isRequired,
    goBack: func.isRequired,
    requestSubmit: func.isRequired,
    submitted: bool,
  };

  constructor(props) {
    super(props);
    const oParser = new DOMParser();
    const document = oParser.parseFromString(props.raw, 'text/xml');

    this.state = {
      document,
      activeField: null,
      touchedFields: [],
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.saveRequested) {
      if (!this.props.submitted) {
        const data = (new XMLSerializer()).serializeToString(this.state.document);
        const percent = this.getPercent();
        this.props.saveResult(data, percent);

        if (this.getPercent() === 1) {
          confirm('Do you want to submit this survey now?').then(
            (r) => { if (r.label === 'Yes') { this.props.requestSubmit(this.props.id); }},
            () => {}
          ).then(
            () => this.props.goBack()
          );
        }
      }
    }
  }

  getPercent() {
    const answers = getRequiredQuestions(this.props.structure)
      .filter(q => this.isRelevant(q.relevant))
      .map(q => this.getValue(q.id))
    ;
    return answers.length ? answers.filter(v => v !== '').length / answers.length : 1;
  }

  getValue = id => this.state.document.querySelector(id).textContent;

  blurField = () => this.setState({ activeField: null });

  focusField = memoize(id => () => this.setState({
    touchedFields: [...this.state.touchedFields, id],
    activeField: id,
  }));

  isTouched = (id) => this.state.touchedFields.indexOf(id) !== -1;

  manageValue = memoize(id => e => {
    const doc = this.state.document;
    const { structure } = this.props;
    // Building new XML document is heavy operation so mutating it directly
    doc.querySelector(id).textContent = e.target ? e.target.value.toString() : e.toString();
    structure.categories.forEach(category =>
      category.questions.forEach(question => {
        if (!this.isRelevant(question.relevant) && this.getValue(question.id)) {
          doc.querySelector(question.id).textContent = '';
        }
      })
    );
    this.forceUpdate();
  });

  isRelevant = (relevant) => {
    if (!relevant) { return true; }
    return document.evaluate(
      relevant,
      this.state.document,
      null,
      XPathResult.BOOLEAN_TYPE,
      null
    ).booleanValue;
  }

  render() {
    console.log(`done ${this.getPercent()}`);
    const { name, structure, submitted } = this.props;
    const currentStructure = {
      ...structure,
      categories: structure.categories
        .filter(c => this.isRelevant(c.relevant))
        .map(c => ({
          ...c,
          questions: c.questions.filter(q => this.isRelevant(q.relevant)),
        }))
        .filter(c => c.questions.length),
    };

    return (
      <div className={styles.result}>
        <Header title={`${name} / ${structure.title}`} confirm={!submitted} />
        <div className={styles.wrapper}>
          <div className={styles.content}>
            {
              currentStructure.categories.map(category =>
                (
                  <div className={styles.category} key={category.id}>
                    <h2>{category.title}</h2>
                    {
                      category.questions.map(question => {
                        const Widget = (widgets[question.type] || widgets.default);
                        const isCascade = question.type.startsWith('cascade');
                        const isFirstCascade = question.type === 'cascade1';
                        return (<div>
                          { !isCascade || isFirstCascade ? <h4>{question.label}</h4> : null }
                          <Widget
                            key={question.id}
                            config={question}
                            value ={this.getValue(question.id)}
                            onChange={this.manageValue(question.id)}
                            onFocus={this.focusField(question.id)}
                            onBlur={this.blurField}

                            disabled={submitted}
                            active={this.state.activeField === question.id}
                            touched={this.isTouched(question.id)}
                          />
                      </div>);
                      })
                    }
                  </div>
                )
              )
            }
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  ({ activeResult }) => ({
    ...activeResult,
    formKey: activeResult.id,
  }),
  { saveResult, goBack: routeActions.goBack, requestSubmit }
)(Result);

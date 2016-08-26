import React, { Component, PropTypes } from 'react';
const { func, object, string } = PropTypes;
import { connect } from 'react-redux';
import { Pivot, reactRenderer } from 'react-winjs';
import MediaQuery from 'react-responsive';
import moment from 'moment';
import cx from 'classnames';

import { List, LongTapWrapper } from 'components';
import {
  requestRemove as requestRemoveResult,
  requestDuplicate as requestDuplicateResult,
  requestSubmit as requestSubmitResult,
 } from 'redux/modules/results';

import {
  selectSurvey,
  requestOpenResult,
} from 'redux/modules/activeResult';

import { Header } from 'components';
import winJSListManager from 'helpers/winJSListManager';

import {
  confirm,
  prompt,
  contextMenu as createContextMenu,
} from 'helpers/platform/ui';


import styles from './Survey.scss';

class Survey extends Component {
  static propTypes = {
    submittedResults: object.isRequired,
    completeResults: object.isRequired,
    inProgressResults: object.isRequired,
    name: string.isRequired,
    id: string.isRequired,

    requestRemoveResult: func.isRequired,
    requestDuplicateResult: func.isRequired,
    requestSubmitResult: func.isRequired,
    requestOpenResult: func.isRequired,
    selectSurvey: func.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.props.selectSurvey(props.id);
  }

  itemInvoked = async e => {
    const item = await e.detail.itemPromise;
    this.props.requestOpenResult(item.data.id);
  };


  resultRenderer = reactRenderer(item => {
    const resultActions = {
      Submit: async () => {
        this.props.requestSubmitResult(item.data.id);
      },
      Duplicate: async () => {
        try {
          const name = await prompt('Name your result');
          this.props.requestDuplicateResult(item.data.id, name);
        } catch (e) {
          console.error(e);
        }
      },
      Remove: async () => {
        const result = await confirm(
          'This cannot be undone',
          'Are you sure you want to remove this result?',
        );
        if (result.id === true) {
          this.props.requestRemoveResult(item.data.id);
        }
      },
    };

    if (item.data.submitted) { delete resultActions.Submit; }

    return (
      <LongTapWrapper onLongTap={createContextMenu(resultActions)}>
        <div
          className={cx({
            [styles.resultListItem]: true,
            [styles.submitting]: item.data.submitting,
          })}
        >
          <div className={styles.resultRow}>
              <span className={styles.resultTitle}>{item.data.name}</span>
              <span className={styles.resultTime}>{moment(item.data.createdAt).fromNow()}</span>
          </div>
          { item.data.progress && item.data.progress !== 1 ? (
            <div className={styles.progress}>
              <div
                className={styles.bar}
                style={{ width: `${(item.data.progress * 100).toFixed(2)}%` }}
              >
                {`${(item.data.progress * 100).toFixed(0)}%`}
              </div>
            </div>
          ) : null }

        </div>
      </LongTapWrapper>
    );
  });


  render() {
    const { name, inProgressResults, completeResults, submittedResults } = this.props;
    return (
      <div className={styles.survey}>
        <Header title={name} />
          <div className={styles.content}>
            <MediaQuery query="(max-width: 900px)">
              <Pivot className={styles.pivot}>
                <Pivot.Item key="in progress" header={`in progress (${inProgressResults.length})`}>
                  <List
                    className={styles.list}
                    list={inProgressResults}
                    itemTemplate={this.resultRenderer}
                    onItemInvoked={this.itemInvoked}
                  />
              </Pivot.Item>
              <Pivot.Item key="complete" header={`complete (${completeResults.length})`}>
                <List
                  className={styles.list}
                  list={completeResults}
                  itemTemplate={this.resultRenderer}
                  onItemInvoked={this.itemInvoked}
                />
              </Pivot.Item>
              <Pivot.Item key="submitted" header={`submitted (${submittedResults.length})`}>
                <List
                  list={submittedResults}
                  itemTemplate={this.resultRenderer}
                  onItemInvoked={this.itemInvoked}
                />
              </Pivot.Item>
            </Pivot>
          </MediaQuery>
          <MediaQuery query="(min-width: 900px)">
            <div className={styles.columns}>
              <div className={styles.column}>
                <h2>{`in progress (${inProgressResults.length})`}</h2>
                <div className={styles.listWrapper}>
                  <List
                    className={styles.list}
                    list={inProgressResults}
                    itemTemplate={this.resultRenderer}
                    onItemInvoked={this.itemInvoked}
                  />
                </div>
              </div>
              <div className={styles.column}>
                <h2>{`complete (${completeResults.length})`}</h2>
                <div className={styles.listWrapper}>
                  <List
                    className={styles.list}
                    list={completeResults}
                    itemTemplate={this.resultRenderer}
                    onItemInvoked={this.itemInvoked}
                  />
                </div>

              </div>
              <div className={styles.column}>
                <h2>{`submitted (${submittedResults.length})`}</h2>
                <div className={styles.listWrapper}>
                  <List
                    className={styles.list}
                    list={submittedResults}
                    itemTemplate={this.resultRenderer}
                    onItemInvoked={this.itemInvoked}
                  />
                </div>

              </div>
            </div>
          </MediaQuery>
        </div>
      </div>
    );
  }
}

export default connect(
  ({ surveys, results }, props) => {
    const id = props.routeParams.surveyId;
    const name = surveys.list[id].name;
    const surveyResults = Object.values(results.list).filter(res => res.surveyId === id);
    const submittedResults = surveyResults.filter(res => res.submitted).reverse();
    const completeResults = surveyResults.filter(
      res => !res.submitted && res.progress === 1
    ).reverse();
    const inProgressResults = surveyResults.filter(
      res => !res.submitted && res.progress !== 1
    ).reverse();
    return {
      name,
      id,
      submittedResults,
      completeResults,
      inProgressResults,
    };
  },
  {
    requestRemoveResult,
    requestDuplicateResult,
    requestSubmitResult,
    selectSurvey,
    requestOpenResult,
  }
)(winJSListManager(['submittedResults', 'completeResults', 'inProgressResults'])(Survey));

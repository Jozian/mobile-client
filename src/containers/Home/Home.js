import React, { Component, PropTypes } from 'react';
const { func, object } = PropTypes;
import { connect } from 'react-redux';
import { Pivot, reactRenderer } from 'react-winjs';
import moment from 'moment';
import cx from 'classnames';
import MediaQuery from 'react-responsive';

import { List, LongTapWrapper } from 'components';
import {
  requestRemove as requestRemoveResult,
  requestDuplicate as requestDuplicateResult,
  requestSubmit as requestSubmitResult,
 } from 'redux/modules/results';

import { requestOpenResult } from 'redux/modules/activeResult';

import {
   requestRemove as requestRemoveSurvey,
} from 'redux/modules/surveys';

import { routeActions } from 'react-router-redux';


import winJSListManager from 'helpers/winJSListManager';
import {
  confirm,
  prompt,
  contextMenu as createContextMenu,
} from 'helpers/platform/ui';

import styles from './Home.scss';

class Home extends Component {
  static propTypes = {
    surveys: object.isRequired,
    savedResults: object.isRequired,
    submittedResults: object.isRequired,
    requestRemoveResult: func.isRequired,
    requestDuplicateResult: func.isRequired,
    requestRemoveSurvey: func.isRequired,
    requestSubmitResult: func.isRequired,
    pushState: func.isRequired,
    requestOpenResult: func.isRequired,
  };

  surveyItemInvoked = async e => {
    const item = await e.detail.itemPromise;
    this.props.pushState(`/survey/${item.data.id}`);
  };

  resultItemInvoked = async e => {
    const item = await e.detail.itemPromise;
    this.props.requestOpenResult(item.data.id);
  };

  surveyRenderer = reactRenderer(item => {
    const surveyActions = {
      Remove: async () => {
        const result = await confirm(
          'This cannot be undone and will result in all results for this survey being deleted',
          'Are you sure you want to remove this survey?',
        );
        if (result.id === true) {
          this.props.requestRemoveSurvey(item.data.id);
        }
      },
    };
    const contextMenu = createContextMenu(surveyActions);

    return (<LongTapWrapper onLongTap={contextMenu}>
      <div className={styles.surveyListItem}>
        <div className={styles.surveyTitle}>{item.data.name}</div>
        <div className={styles.time}>{moment(item.data.time).fromNow()}</div>
      </div>
    </LongTapWrapper>);
  });

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
    const contextMenu = createContextMenu(resultActions);
    return (
      <LongTapWrapper onLongTap={contextMenu}>
        <div
          className={cx({
            [styles.surveyListItem]: true,
            [styles.submitting]: item.data.submitting,
          })}
        >
          <div className={styles.resultRow}>
              <span className={styles.resultTitle}>{item.data.name}</span>
              <span className={styles.resultTime}>{moment(item.data.createdAt).fromNow()}</span>
          </div>
          <div className={styles.resultSurveyTitle}>{item.data.surveyName}</div>
        </div>
      </LongTapWrapper>
    );
  });


  render() {
    const { surveys, savedResults, submittedResults } = this.props;
    return (
      <div className={styles.home}>
        <div className={styles.header}>
          <img src="/images/applogo.png" />
        </div>
        <div className={styles.content}>
          <MediaQuery query="(max-width: 900px)">
            <Pivot className={styles.pivot}>
              <Pivot.Item key="surveys" header="my surveys">
                <List
                  className={styles.list}
                  list={surveys}
                  itemTemplate={this.surveyRenderer}
                  onItemInvoked={this.surveyItemInvoked}
                />
              </Pivot.Item>
              <Pivot.Item key="saved" header="saved">
                <List
                  className={styles.list}
                  list={savedResults}
                  itemTemplate={this.resultRenderer}
                  onItemInvoked={this.resultItemInvoked}
                />
              </Pivot.Item>
              <Pivot.Item key="submitted" header="submitted">
                <List
                  list={submittedResults}
                  itemTemplate={this.resultRenderer}
                  onItemInvoked={this.resultItemInvoked}
                />
              </Pivot.Item>
            </Pivot>
          </MediaQuery>
          <MediaQuery query="(min-width: 900px)">
            <div className={styles.columns}>
              <div className={styles.column}>
                <h2>my surveys</h2>
                <div className={styles.listWrapper}>
                  <List
                    className={styles.list}
                    list={surveys}
                    itemTemplate={this.resultRenderer}
                    onItemInvoked={this.surveyItemInvoked}
                  />
                </div>
              </div>
              <div className={styles.column}>
                <h2>{`saved (${savedResults.length})`}</h2>
                <div className={styles.listWrapper}>
                  <List
                    className={styles.list}
                    list={savedResults}
                    itemTemplate={this.resultRenderer}
                    onItemInvoked={this.resultItemInvoked}
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
                    onItemInvoked={this.resultItemInvoked}
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
  ({ surveys, results }) => {
    const mappedResults = Object.values(results.list).map(result => ({
      ...result,
      surveyName: surveys.list[result.surveyId] ? surveys.list[result.surveyId].name : '---',
    }));
    return {
      surveys: Object.values(surveys.list).reverse(),
      submittedResults: mappedResults.filter(res => res.submitted).reverse(),
      savedResults: mappedResults.filter(res => !res.submitted).reverse(),
    };
  },
  {
    requestRemoveResult,
    requestDuplicateResult,
    requestRemoveSurvey,
    requestSubmitResult,
    pushState: routeActions.push,
    requestOpenResult,
  }
)(winJSListManager(['surveys', 'submittedResults', 'savedResults'])(Home));

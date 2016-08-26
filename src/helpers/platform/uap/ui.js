import React from 'react';
import ReactDOM from 'react-dom';
import { ContentDialog } from 'react-winjs';

export const alert = (message) => {
  const msgBox = new Windows.UI.Popups.MessageDialog(message);
  return msgBox.showAsync();
};

export const confirm = (...args) => {
  const noop = () => ({});
  const msg = new Windows.UI.Popups.MessageDialog(...args);
  msg.commands.append(new Windows.UI.Popups.UICommand('Yes', noop, true));
  msg.commands.append(new Windows.UI.Popups.UICommand('No', noop, false));
  return msg.showAsync();
};

export const prompt = (title) => {
  const input = (<input
    autoFocus
    className="win-textbox"
    type="text"
  />);

  const content = (<ContentDialog
    title={title}
    primaryCommandText="OK"
    secondaryCommandText="Cancel"
  >
    { input }
  </ContentDialog>);
  const dom = document.querySelector('#prompt');
  dom.innerHTML = '';
  const promptInstance = ReactDOM.render(content, dom);
  setTimeout(() => dom.querySelector('input').focus());
  return promptInstance.winControl.show().then(({ result }) => {
    const { value } = dom.querySelector('input');
    if (result !== 'primary' || !value) {
      return Promise.reject(null);
    }

    return Promise.resolve(value);
  });
};
/*
function pageToWinRT(pageX, pageY) {
  const zoomFactor = document.documentElement.msContentZoomFactor;
  return {
    x: (pageX - window.pageXOffset) * zoomFactor,
    y: (pageY - window.pageYOffset) * zoomFactor,
  };
}
*/
export const contextMenu = commands => e => {
  const menu = new Windows.UI.Popups.PopupMenu();
  for (const [text, handler] of Object.entries(commands)) {
    menu.commands.append(new Windows.UI.Popups.UICommand(text, handler));
  }
  e.preventDefault();
  e.stopPropagation();
  return menu.showAsync({ x: e.clientX, y: e.clientY });
};

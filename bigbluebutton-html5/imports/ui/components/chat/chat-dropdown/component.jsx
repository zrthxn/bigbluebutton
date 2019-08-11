import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Clipboard from 'clipboard';
import _ from 'lodash';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import Auth from '/imports/ui/services/auth';
import Button from '/imports/ui/components/button/component';

import ChatService from '../service';

const intlMessages = defineMessages({
  clear: {
    id: 'app.chat.dropdown.clear',
    description: 'Clear button label',
  },
  save: {
    id: 'app.chat.dropdown.save',
    description: 'Clear button label',
  },
  copy: {
    id: 'app.chat.dropdown.copy',
    description: 'Copy button label',
  },
  options: {
    id: 'app.chat.dropdown.options',
    description: 'Chat Options',
  },
});

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

class ChatDropdown extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isSettingOpen: false,
    };

    this.onActionsShow = this.onActionsShow.bind(this);
    this.onActionsHide = this.onActionsHide.bind(this);
    this.actionsKey = [
      _.uniqueId('action-item-'),
      _.uniqueId('action-item-'),
      _.uniqueId('action-item-'),
    ];
  }

  componentDidMount() {
    this.clipboard = new Clipboard('#clipboardButton', {
      text: () => ChatService.exportChat(ChatService.getPublicGroupMessages()),
    });
  }

  componentWillUnmount() {
    this.clipboard.destroy();
  }

  onActionsShow() {
    this.setState({
      isSettingOpen: true,
    });
  }

  onActionsHide() {
    this.setState({
      isSettingOpen: false,
    });
  }

  getAvailableActions() {
    const { intl, isMeteorConnected } = this.props;

    const clearIcon = 'delete';
    const saveIcon = 'download';
    const copyIcon = 'copy';

    const user = ChatService.getUser(Auth.userID);

    return _.compact([
      <DropdownListItem
        data-test="chatSave"
        icon={saveIcon}
        label={intl.formatMessage(intlMessages.save)}
        key={this.actionsKey[0]}
        onClick={() => {
          const link = document.createElement('a');
          const mimeType = 'text/plain';

          link.setAttribute('download', `public-chat-${Date.now()}.txt`);
          link.setAttribute(
            'href',
            `data: ${mimeType} ;charset=utf-8,
            ${encodeURIComponent(ChatService.exportChat(ChatService.getPublicGroupMessages()))}`,
          );
          link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        }}
      />,
      <DropdownListItem
        data-test="chatCopy"
        icon={copyIcon}
        id="clipboardButton"
        label={intl.formatMessage(intlMessages.copy)}
        key={this.actionsKey[1]}
      />,
      user.role === ROLE_MODERATOR && isMeteorConnected ? (
        <DropdownListItem
          data-test="chatClear"
          icon={clearIcon}
          label={intl.formatMessage(intlMessages.clear)}
          key={this.actionsKey[2]}
          onClick={ChatService.clearPublicChatHistory}
        />
      ) : null,
    ]);
  }

  render() {
    const { intl } = this.props;
    const { isSettingOpen } = this.state;

    const availableActions = this.getAvailableActions();

    return (
      <Dropdown
        isOpen={isSettingOpen}
        onShow={this.onActionsShow}
        onHide={this.onActionsHide}
      >
        <DropdownTrigger tabIndex={0}>
          <Button
            data-test="chatDropdownTrigger"
            icon="more"
            size="sm"
            ghost
            circle
            hideLabel
            color="dark"
            label={intl.formatMessage(intlMessages.options)}
            aria-label={intl.formatMessage(intlMessages.options)}
            onClick={() => null}
          />
        </DropdownTrigger>
        <DropdownContent placement="bottom right">
          <DropdownList>{availableActions}</DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }
}

export default withModalMounter(injectIntl(ChatDropdown));

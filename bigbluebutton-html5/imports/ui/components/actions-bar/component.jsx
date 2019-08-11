import React, { PureComponent } from 'react';
import cx from 'classnames';
import { styles } from './styles.scss';
import DesktopShare from './desktop-share/component';
import ActionsDropdown from './actions-dropdown/component';
import QuickPollDropdown from './quick-poll-dropdown/component';
import AudioControlsContainer from '../audio/audio-controls/container';
import JoinVideoOptionsContainer from '../video-provider/video-button/container';
import CaptionsButtonContainer from '/imports/ui/components/actions-bar/captions/container';
import PresentationOptionsContainer from './presentation-options/component';

class ActionsBar extends PureComponent {
  componentDidUpdate(prevProps) {
    const { isThereCurrentPresentation: prevIsThereCurrPresentation } = prevProps;
    const {
      isThereCurrentPresentation,
      getSwapLayout,
      toggleSwapLayout,
      isSharingVideo,
      isVideoBroadcasting,
    } = this.props;

    if (!isThereCurrentPresentation && !isSharingVideo && !isVideoBroadcasting) {
      if (!getSwapLayout()) {
        toggleSwapLayout();
      }
    }

    if (!prevIsThereCurrPresentation && isThereCurrentPresentation && !isSharingVideo && !isVideoBroadcasting) {
      if (getSwapLayout()) {
        toggleSwapLayout();
      }
    }
  }

  render() {
    const {
      isUserPresenter,
      handleExitVideo,
      handleJoinVideo,
      handleShareScreen,
      handleUnshareScreen,
      isVideoBroadcasting,
      isUserModerator,
      recordSettingsList,
      toggleRecording,
      screenSharingCheck,
      enableVideo,
      isLayoutSwapped,
      toggleSwapLayout,
      handleTakePresenter,
      intl,
      currentSlidHasContent,
      parseCurrentSlideContent,
      isSharingVideo,
      screenShareEndAlert,
      stopExternalVideoShare,
      screenshareDataSavingSetting,
      isCaptionsAvailable,
      isMeteorConnected,
      isPollingEnabled,
      isThereCurrentPresentation,
    } = this.props;

    const {
      allowStartStopRecording,
      recording: isRecording,
      record,
    } = recordSettingsList;

    const actionBarClasses = {};
    const { enabled: enableExternalVideo } = Meteor.settings.public.externalVideoPlayer;

    actionBarClasses[styles.centerWithActions] = isUserPresenter;
    actionBarClasses[styles.center] = true;

    return (
      <div className={styles.actionsbar}>
        <div className={styles.left}>
          <ActionsDropdown {...{
            isUserPresenter,
            isUserModerator,
            isPollingEnabled,
            allowStartStopRecording,
            allowExternalVideo: enableExternalVideo,
            isRecording,
            record,
            toggleRecording,
            handleTakePresenter,
            intl,
            isSharingVideo,
            stopExternalVideoShare,
            isMeteorConnected,
          }}
          />
          {isPollingEnabled
            ? (
              <QuickPollDropdown
                {...{
                  currentSlidHasContent,
                  intl,
                  isUserPresenter,
                  parseCurrentSlideContent,
                }}
              />
            ) : null
          }
          {isCaptionsAvailable
            ? (
              <CaptionsButtonContainer {...{ intl }} />
            )
            : null
          }
        </div>
        <div
          className={
            isUserPresenter ? cx(styles.centerWithActions, actionBarClasses) : styles.center
          }
        >
          <AudioControlsContainer />
          {enableVideo
            ? (
              <JoinVideoOptionsContainer
                handleJoinVideo={handleJoinVideo}
                handleCloseVideo={handleExitVideo}
              />
            )
            : null}
          <DesktopShare {...{
            handleShareScreen,
            handleUnshareScreen,
            isVideoBroadcasting,
            isUserPresenter,
            screenSharingCheck,
            screenShareEndAlert,
            isMeteorConnected,
            screenshareDataSavingSetting,
          }}
          />
        </div>
        <div className={styles.right}>
          {isLayoutSwapped
            ? (
              <PresentationOptionsContainer
                toggleSwapLayout={toggleSwapLayout}
                isThereCurrentPresentation={isThereCurrentPresentation}
              />
            )
            : null
          }
        </div>
      </div>
    );
  }
}

export default ActionsBar;

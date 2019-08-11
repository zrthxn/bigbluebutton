import Presentations from '/imports/api/presentations';
import { isVideoBroadcasting } from '/imports/ui/components/screenshare/service';
import { getVideoId } from '/imports/ui/components/external-video-player/service';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import Settings from '/imports/ui/services/settings';
import VideoService from '/imports/ui/components/video-provider/service';
import PollingService from '/imports/ui/components/polling/service';
import getFromUserSettings from '/imports/ui/services/users-settings';

const LAYOUT_CONFIG = Meteor.settings.public.layout;
const KURENTO_CONFIG = Meteor.settings.public.kurento;

const getPresentationInfo = () => {
  const currentPresentation = Presentations.findOne({
    current: true,
  });

  return {
    current_presentation: (currentPresentation != null),
  };
};

const isUserPresenter = () => Users.findOne({ userId: Auth.userID }).presenter;

function shouldShowWhiteboard() {
  return true;
}

function shouldShowScreenshare() {
  const { viewScreenshare } = Settings.dataSaving;
  const enableScreensharing = getFromUserSettings('enableScreensharing', KURENTO_CONFIG.enableScreensharing);
  return enableScreensharing && viewScreenshare && isVideoBroadcasting();
}

function shouldShowExternalVideo() {
  const { enabled: enableExternalVideo } = Meteor.settings.public.externalVideoPlayer;
  return enableExternalVideo && getVideoId();
}

function shouldShowOverlay() {
  return getFromUserSettings('enableVideo', KURENTO_CONFIG.enableVideo);
}

const swapLayout = {
  value: getFromUserSettings('autoSwapLayout', LAYOUT_CONFIG.autoSwapLayout),
  tracker: new Tracker.Dependency(),
};

const setSwapLayout = () => {
  swapLayout.value = getFromUserSettings('autoSwapLayout', LAYOUT_CONFIG.autoSwapLayout);
  swapLayout.tracker.changed();
};

const toggleSwapLayout = () => {
  swapLayout.value = !swapLayout.value;
  swapLayout.tracker.changed();
};

export const shouldEnableSwapLayout = () => {
  const { viewParticipantsWebcams } = Settings.dataSaving;
  const usersVideo = VideoService.getAllUsersVideo();
  const poll = PollingService.mapPolls();

  return usersVideo.length > 0 // prevent swap without any webcams
  && viewParticipantsWebcams // prevent swap when dataSaving for webcams is enabled
  && !poll.pollExists; // prevent swap when there is a poll running
};

export const getSwapLayout = () => {
  swapLayout.tracker.depend();
  return swapLayout.value;
};

export default {
  getPresentationInfo,
  shouldShowWhiteboard,
  shouldShowScreenshare,
  shouldShowExternalVideo,
  shouldShowOverlay,
  isUserPresenter,
  isVideoBroadcasting,
  toggleSwapLayout,
  shouldEnableSwapLayout,
  getSwapLayout,
  setSwapLayout,
};

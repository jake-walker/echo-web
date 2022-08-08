import { Box, Button, Navbar, NavLink, Stack } from "@mantine/core";
import { Root } from "react-dom/client";
import { Hash, Settings } from "react-feather";
import { useDispatch, useSelector } from "react-redux";
import { chatActions } from "../slices/chat";
import { RootState } from "../store";

function ChannelList(props: { hidden: boolean }) {
  const dispatch = useDispatch();
  const isConnected = useSelector((state: RootState) => state.chat.isConnected);
  const isConnecting = useSelector((state: RootState) => state.chat.isEstablishingConnection);
  const channels = useSelector((state: RootState) => state.chat.channels);
  const currentChannel = useSelector((state: RootState) => state.chat.currentChannel);

  const connectText = isConnected ? 'Disconnect' : 'Connect';
  const connectClick = () => {
    if (isConnected) {
      dispatch(chatActions.disconnect());
    } else {
      dispatch(chatActions.connect());
    }
  }

  return (
    <Navbar width={{ base: '100%', sm: 200, md: 300 }} p="sm" hidden={props.hidden} hiddenBreakpoint="sm">
      <Stack sx={{ flexGrow: 1 }}>
        <Box>
          {channels.map((channel) => (
            <NavLink
              key={`channel_${channel}`}
              label={channel}
              icon={<Hash />}
              active={channel === currentChannel}
              onClick={() => dispatch(chatActions.changeChannel({ channel }))}
            />
          ))}
        </Box>
      </Stack>
      <Button.Group>
        <Button
          sx={{ flexGrow: 1 }}
          onClick={connectClick}
          loading={!isConnected && isConnecting}
        >
          {connectText}
        </Button>
        <Button variant="outline">
          <Settings size={20} />
        </Button>
      </Button.Group>
    </Navbar>
  )
}

export default ChannelList

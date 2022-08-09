import { AppShell, Box, Button, Grid, Group, Input, Stack, TextInput } from "@mantine/core"
import { useState, createRef, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import ChannelList from "./components/ChannelList"
import Header from "./components/Header"
import MemberList from "./components/MemberList"
import Message from "./components/Message"
import { chatActions } from "./slices/chat"
import { RootState } from "./store"

function App() {
  const [opened, setOpened] = useState(false);
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const isConnected = useSelector((state: RootState) => state.chat.isConnected);
  const currentChannel = useSelector((state: RootState) => state.chat.currentChannel);
  const messages = useSelector((state: RootState) => state.chat.messages);

  const messagesEndRef = createRef<HTMLDivElement>();

  const chatDisabled = currentChannel === null || !isConnected;

  const sendMessage = () => {
    dispatch(chatActions.sendMessage({ content: message }));
    setMessage("");
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages]);

  return (
    <AppShell
      padding={0}
      navbarOffsetBreakpoint="sm"
      navbar={<ChannelList hidden={!opened} />}
      header={<Header opened={opened} setOpened={setOpened} />}
      aside={<MemberList />}
    >
      <Stack sx={{ height: "calc(100vh - 60px)", maxHeight: "calc(100vh - 60px)" }} spacing={0}>
        <Stack sx={{ overflowY: "scroll", flexGrow: 1 }} p="md">
          {messages.map((msg, i) => (
            <Message key={`msg${i}`} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Group p="md" sx={(theme) => ({ borderTop: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]}` })}>
          <TextInput sx={{ flexGrow: 1 }} placeholder="Message" disabled={chatDisabled} value={message} onChange={(event) => setMessage(event.target.value)} onKeyUp={(event) => {
            if (event.key === "Enter") {
              sendMessage();
            }
          }}/>
          <Button disabled={chatDisabled} onClick={() => sendMessage()}>Send</Button>
        </Group>
      </Stack>
    </AppShell>
  )
}

export default App

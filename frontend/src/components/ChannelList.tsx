import { ActionIcon, Box, Button, Group, Navbar, NavLink, Stack } from "@mantine/core";
import { Hash, Settings } from "react-feather";

function ChannelList(props: { hidden: boolean }) {
  return (
    <Navbar width={{ base: '100%', sm: 200, md: 300 }} p="sm" hidden={props.hidden} hiddenBreakpoint="sm">
      <Stack sx={{ flexGrow: 1 }}>
        <Box>
          {[...Array(4)].map((e, i) => (
            <NavLink label={`Channel ${i+1}`} icon={<Hash />}/>
          ))}
        </Box>
      </Stack>
      <Button.Group>
        <Button sx={{ flexGrow: 1 }}>Connect</Button>
        <Button variant="outline">
          <Settings size={20} />
        </Button>
      </Button.Group>
    </Navbar>
  )
}

export default ChannelList

import { Navbar, NavLink } from "@mantine/core";
import { Hash } from "react-feather";

function ChannelList() {
  return (
    <Navbar width={{ base: 300 }} p="xs">
      {[...Array(4)].map((e, i) => (
        <NavLink label={`Channel ${i+1}`} icon={<Hash />}/>
      ))}
    </Navbar>
  )
}

export default ChannelList

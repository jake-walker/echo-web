import { Box, Flex } from '@chakra-ui/react'
import { useState } from 'react'

function App() {
  return (
    <>
      <Flex direction="column" height="100%">
        <Box bg="red" flexGrow="1">
          <h1>Hello World!</h1>
        </Box>
        <Box>
          <h1>Hello</h1>
        </Box>
      </Flex>
    </>
  )
}

export default App

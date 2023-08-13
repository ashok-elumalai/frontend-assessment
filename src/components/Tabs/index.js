// library import goes here.
import * as React from 'react';

// Using material UI's component, but we are importing it with particular component name
// so that it will only utilise that particular lib inspect of whole lib 
// and it avoid unused components while bundling
import { useMediaQuery } from 'react-responsive'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import IosShareIcon from '@mui/icons-material/IosShare';
import ExtensionIcon from '@mui/icons-material/Extension';
import { styled } from "@mui/material/styles";
import MuiButton from "@mui/material/Button";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { blue } from '@mui/material/colors';

// local file import goes here.
import ReactTable from '../ReactTable';

// adding styles to custom MUI's components 
export const CustomButton = styled(MuiButton)(() => ({
    color: "grey",
    marginRight: "8px",
    fontSize: "13px"
}));

const AddNewProductButton = styled(MuiButton)(() => ({
    borderRadius: "100px", 
    marginRight: "18px", 
    fontSize: "13px !important"
}))

const WrapperForBigScreens = styled(Box)(() => ({
    right: "20px",
    top: "30px",
    display: "flex",
    justifyContent: "flex-end",
    position: "absolute"
}))

const WrapperForSmallScreens = styled(Box)(() => ({
    right: "20px",
    top: "30px",
    display: "flex",
    justifyContent: "center",
    position: "unset"
}))

const ButtonStack = styled(Stack)(() => ({
    display: "flex", 
    justifyContent: "space-between",
    flexDirection: "row"
}))

const ImportIconWrapper = styled(ExtensionIcon)(()=>({
    marginRight: "-6px", 
    marginTop: "8px", 
    color: "grey", 
    fontSize: "16px"
}))

const ExportIconWrapper = styled(IosShareIcon)(()=>({
    marginRight: "-6px", 
    marginTop: "7px", 
    color: "grey", 
    fontSize: "16px"
}))

const TabWrapper = styled(Tabs)(()=>({
    '.MuiTabs-indicator': {
        width: "0 !important",
    },
}))

// CustomTabPanel is a function which displays each tab contents

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

export default function TabComponent() {
    const [value, setValue] = React.useState(0);

    const onHandleChange = (event, newValue) => {
        setValue(newValue);
    };

    // adding custom colour to MUI's button 
    const theme = createTheme({
        palette: {
            primary: {
                main: blue[900]
            },
        }
    });

// Added bit style to make a page responsive(Basic responsive) for both smaller and bigger device .
const isTabletOrMobile = useMediaQuery({ maxWidth: 600 })
const ButtonWrapper = isTabletOrMobile ? WrapperForSmallScreens : WrapperForBigScreens

    return (
        <Box sx={{ width: '100%' }} className="tabs-container">
            {/* Buttwrapper contains all the buttons on the header */}
            <ButtonWrapper className="buttton-wrapper">
                <ButtonStack>
                    <ThemeProvider theme={theme}>
                        <AddNewProductButton variant="contained" color='primary' startIcon={<AddIcon />}>Add New Product</AddNewProductButton>
                    </ThemeProvider>
                    <ImportIconWrapper />
                    <CustomButton variant="text" color='secondary'>Import Data</CustomButton>
                    <ExportIconWrapper />
                    <CustomButton variant="text">Export Csv</CustomButton>
                </ButtonStack >
            </ButtonWrapper>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabWrapper value={value}
                    onChange={onHandleChange}
                    aria-label="basic tabs example"
                >
                    <Tab label={<p className='tab-label black-text'>Inventory</p>} />
                    <Tab label={<p className='tab-label'>Collections</p>} />
                    <Tab label={<p className='tab-label'>Analytics</p>} />
                </TabWrapper>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <ReactTable />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                Collections
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                Analytics
            </CustomTabPanel>
        </Box >
    );
}

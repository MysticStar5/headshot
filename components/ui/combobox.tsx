import * as React from "react";

const Combobox = ({ title, options, value, setValue }: { title: string, options: any[], value?: string | undefined, setValue?: any }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const [key, setKey] = React.useState(options[0]["key"]);

    // React.useEffect(() => {
    //     const optionFromProps = options.filter((option: any) => option.value == value ?? options[0].value)[0]?.title
    //     if (option != optionFromProps) {
    //         setValue(options.filter((option: any) => option.value == value ?? options[0].value)[0]?.title);
    //     }

    // }, [value])

    const ref = React.useRef<HTMLDivElement>(null);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const closeDropdown = () => {
        setIsOpen(false);
    };

    React.useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event: any) {
            if (ref.current && !ref.current.contains(event.target)) {
                closeDropdown();
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref]);

    return (
        <div className="flex flex-row px-[12px] py-[6px] gap-[8px] rounded-[6px] border-solid border-[1px] border-[#FEFEFE1A]" ref={ref}>
            <p className="font-sans font-[500] text-[14px] landing-[24px] text-[#6C7275]">{title}</p>
            <div className="border-l border-s-[#6C727580]"></div>
            {/* <select className="row-start-1 col-start-1 w-[64px] h-[24px] bg-[#232627] border-none outline-none font-sans font-[600] text-[14px] landing-[24px] text-[#FEFEFE]">
                {options.map((option, index) => (
                    <option key={index}>
                        <div className="pl-[12px] py-[8px] bg-[#141718] hover:bg-[#E8ECEF] text-[#6C7275] hover:text-[#141718]">
                            {option}
                        </div>
                    </option>
                ))}
            </select> */}
            <div className="relative inline-block">

                <button type="button" onClick={toggleDropdown}>
                    <div className="flex flex-row items-center w-[64px] h-[24px] bg-[#232627] border-none outline-none font-sans font-[600] text-[14px] landing-[24px] text-[#FEFEFE]">
                        <p className="w-[60px] h-[24px] overflow-hidden">{key}</p>
                        <svg className="w-2.5 h-2.5 ml-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
                        </svg>
                    </div>
                </button>

                {isOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 rounded-lg shadow-lg bg-[#141718] border-solid border-1 border-[#343839] z-10">
                        <ul role="menu" aria-orientation="vertical" aria-labelledby="options-menu" className="p-[16px] gap-[4px]">
                            {options.map((option, index) => (
                                <li>
                                    <a
                                        // href="#"
                                        className="block px-4 py-2 text-sm rounded-md hover:bg-[#E8ECEF] font-sans font-[600] text-[14px] landing-[24px] text-[#6C7275] hover:text-[#141718]"
                                        onClick={() => {
                                            if (setValue) {
                                                setValue(option.value);
                                            }
                                            setKey(option.key);
                                            closeDropdown();
                                        }}
                                    >
                                        {option.key}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Combobox;
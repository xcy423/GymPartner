import svgPaths from "./svg-y239eo8wai";

function Container1() {
  return (
    <div className="relative shrink-0 w-[176.945px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[31.5px] not-italic relative shrink-0 text-[#1b1b1b] text-[21px] whitespace-nowrap">Sarah Tan · Hall 3</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="drop-shadow-[0px_2px_4px_rgba(0,0,0,0.06)] relative rounded-[25px] shrink-0" style={{ backgroundImage: "linear-gradient(90deg, rgba(100, 153, 47, 0.9) 0%, rgba(100, 153, 47, 0.9) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }} data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[16px] py-[8px] relative size-full">
        <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">All tickets</p>
      </div>
    </div>
  );
}

function Top() {
  return (
    <div className="relative rounded-[16px] shrink-0 w-full" data-name="top">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative size-full">
        <Container1 />
        <Container2 />
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d="M4.5 2.7L7.8 6L4.5 9.3" id="Vector" stroke="var(--stroke-0, #265E00)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#e8f4d4] content-stretch flex gap-[4px] items-center px-[10px] py-[4px] relative rounded-[100px] shrink-0" data-name="Button">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[18px] not-italic relative shrink-0 text-[#265e00] text-[10px] text-center whitespace-nowrap">Points Log</p>
      <Icon />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex h-[15px] items-start justify-between relative shrink-0 w-full">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#e8f4d4] text-[12px] whitespace-nowrap">Your Green Points Rank</p>
      <Button />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#e8f4d4] text-[10px]">{`You're building the habit!`}</p>
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[18px] relative shrink-0 text-[12px] text-white">Seeding (Lv.1)</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col items-start not-italic relative shrink-0 w-full whitespace-nowrap">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[40px] text-white">850</p>
      <Frame1 />
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">
        <Frame4 />
        <Frame2 />
      </div>
    </div>
  );
}

function Container7() {
  return <div className="bg-gradient-to-r from-[#64992f] h-[7px] relative rounded-[16777200px] shrink-0 to-[#7cbc3b] w-[172px]" data-name="Container" />;
}

function Container6() {
  return (
    <div className="bg-[#e8f4d4] content-stretch flex flex-col h-[7px] items-start overflow-clip relative rounded-[16777200px] shrink-0 w-full" data-name="Container">
      <Container7 />
    </div>
  );
}

function ContainerMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0 w-full" data-name="Container (margin)">
      <Container6 />
    </div>
  );
}

function Container8() {
  return (
    <div className="[word-break:break-word] content-stretch flex font-['Inter:Bold',sans-serif] font-bold h-[18px] items-start justify-between leading-[18px] not-italic relative shrink-0 text-[12px] w-full whitespace-nowrap" data-name="Container">
      <p className="relative shrink-0 text-white">850/1000 GP</p>
      <p className="relative shrink-0 text-[#e8f4d4]">85%</p>
    </div>
  );
}

function Bar() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="bar">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start justify-center relative size-full">
        <ContainerMargin />
        <Container8 />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-end justify-center relative size-full">
        <Bar />
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[6px] items-start relative size-full">
        <Container5 />
        <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[0] min-w-full not-italic relative shrink-0 text-[#265e00] text-[10px] w-[min-content]">
          <span className="font-['Inter:Bold',sans-serif] font-bold leading-[normal]">{` 150 GP`}</span>
          <span className="leading-[normal]">{` `}</span>
          <span className="font-['Inter:Regular',sans-serif] font-normal leading-[normal]">to reach next level:</span>
          <span className="leading-[normal]">{` `}</span>
          <span className="font-['Inter:Bold',sans-serif] font-bold leading-[normal]">Sprout</span>
          <span className="leading-[normal]">!</span>
        </p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[186px] relative rounded-[16px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.07)] shrink-0 w-full" style={{ backgroundImage: "linear-gradient(-65.6929deg, rgb(100, 153, 47) 2.1854%, rgb(74, 122, 34) 94.916%)" }} data-name="Container">
      <div className="flex flex-col justify-center overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-between p-[16px] relative size-full">
          <div className="absolute left-[246px] size-[146px] top-[-59px]">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 146 146">
              <circle cx="73" cy="73" fill="var(--fill-0, #E8F4D4)" fillOpacity="0.5" id="Ellipse 3" opacity="0.5" r="73" />
            </svg>
          </div>
          <div className="absolute left-[230px] size-[100px] top-[13px]">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="var(--fill-0, #E8F4D4)" fillOpacity="0.5" id="Ellipse 1" opacity="0.5" r="50" />
            </svg>
          </div>
          <div className="absolute left-[284px] size-[50px] top-[81px]">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 50">
              <circle cx="25" cy="25" fill="var(--fill-0, #E8F4D4)" fillOpacity="0.5" id="Ellipse 2" opacity="0.5" r="25" />
            </svg>
          </div>
          <Frame />
          <Container4 />
        </div>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[22px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="Icon">
          <path d={svgPaths.p3dadee40} id="Vector" stroke="var(--stroke-0, #64992F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.83333" />
        </g>
      </svg>
    </div>
  );
}

function Container10() {
  return (
    <div className="bg-[#e8f4d4] relative rounded-[8px] shrink-0 size-[44px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon1 />
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="relative shrink-0 w-full" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[21px] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">Redeem Aircon Credits</p>
      </div>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[19px] relative shrink-0 w-[157px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-px relative size-full">
        <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic relative shrink-0 text-[#e8f4d4] text-[12px] whitespace-nowrap">You can redeem 1 ticket!</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="relative shrink-0 w-[157px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Paragraph />
        <Paragraph1 />
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative size-full">
        <Container10 />
        <Container11 />
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d="M7.5 4.5L13 10L7.5 15.5" id="Vector" stroke="var(--stroke-0, #E8F4D4)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="drop-shadow-[0px_4px_10px_rgba(0,0,0,0.07)] relative rounded-[16px] shrink-0 w-full" style={{ backgroundImage: "linear-gradient(90deg, rgba(100, 153, 47, 0.9) 0%, rgba(100, 153, 47, 0.9) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }} data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between p-[16px] relative size-full">
          <Container9 />
          <Icon2 />
        </div>
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="h-[21px] relative shrink-0 w-[162.102px]" data-name="Heading 2">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[21px] left-0 not-italic text-[#1b1b1b] text-[14px] top-0 whitespace-nowrap">Your Real-World Impact</p>
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="bg-[#e8f4d4] relative rounded-[16777200px] shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[8px] py-[2px] relative size-full">
        <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[15px] not-italic relative shrink-0 text-[#64992f] text-[10px] whitespace-nowrap">2.5 kg recycled</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Heading />
      <Text />
    </div>
  );
}

function Frame3() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">
        <Container13 />
        <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#5a5a5a] text-[11px] w-[310px]">{`That's not just waste avoided — here's what your effort equals:`}</p>
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Icon">
          <path d={svgPaths.p1912e080} id="Vector" stroke="var(--stroke-0, #64992F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p1bddbf80} id="Vector_2" stroke="var(--stroke-0, #64992F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Container16() {
  return (
    <div className="bg-[#e8f4d4] relative rounded-[8px] shrink-0 size-[38px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon3 />
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="mb-[-3px] relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center not-italic relative size-full whitespace-nowrap">
        <p className="font-['Inter:Bold',sans-serif] font-bold leading-[27px] relative shrink-0 text-[#64992f] text-[18px]">7</p>
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[18px] relative shrink-0 text-[#5a5a5a] text-[10px]">takeaway boxes of food waste kept out of landfills</p>
      </div>
    </div>
  );
}

function Container20() {
  return <div className="bg-[#7cbc3b] h-[4px] relative rounded-[16777200px] shrink-0 w-[187.195px]" data-name="Container" />;
}

function Container19() {
  return (
    <div className="bg-[#e8f4d4] content-stretch flex flex-col h-[4px] items-start overflow-clip relative rounded-[16777200px] shrink-0 w-full" data-name="Container">
      <Container20 />
    </div>
  );
}

function ContainerMargin1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[4px] relative size-full">
        <Container19 />
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="flex-[260_0_0] h-full min-w-px relative" data-name="Container">
      <div className="flex flex-col justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-between py-[2px] relative size-full">
          <Container18 />
          <ContainerMargin1 />
        </div>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[36px] relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative size-full">
        <Container16 />
        <Container17 />
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Icon">
          <path d={svgPaths.p8042000} id="Vector" stroke="var(--stroke-0, #64992F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p29a45a40} id="Vector_2" stroke="var(--stroke-0, #64992F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p1b55ca50} id="Vector_3" stroke="var(--stroke-0, #64992F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Container22() {
  return (
    <div className="bg-[#e8f4d4] relative rounded-[8px] shrink-0 size-[38px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon4 />
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[18px] relative shrink-0 w-[129.766px]" data-name="Text">
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#5a5a5a] text-[10px] top-[0.5px] whitespace-nowrap">CO₂ emissions avoided</p>
    </div>
  );
}

function Container24() {
  return (
    <div className="mb-[-3px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center relative size-full">
        <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[27px] not-italic relative shrink-0 text-[#64992f] text-[18px] whitespace-nowrap">3.5 kg</p>
        <Text1 />
      </div>
    </div>
  );
}

function Container26() {
  return <div className="bg-[#7cbc3b] h-[4px] relative rounded-[16777200px] shrink-0 w-[143px]" data-name="Container" />;
}

function Container25() {
  return (
    <div className="bg-[#e8f4d4] content-stretch flex flex-col h-[4px] items-start overflow-clip relative rounded-[16777200px] shrink-0 w-full" data-name="Container">
      <Container26 />
    </div>
  );
}

function ContainerMargin2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[4px] relative size-full">
        <Container25 />
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="flex-[260_0_0] h-full min-w-px relative" data-name="Container">
      <div className="flex flex-col justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-between py-[2px] relative size-full">
          <Container24 />
          <ContainerMargin2 />
        </div>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[36px] relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative size-full">
        <Container22 />
        <Container23 />
      </div>
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Icon">
          <path d={svgPaths.p3d881d00} id="Vector" stroke="var(--stroke-0, #64992F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Container28() {
  return (
    <div className="bg-[#e8f4d4] relative rounded-[8px] shrink-0 size-[38px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon5 />
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[27px] relative shrink-0 w-[10.469px]" data-name="Text">
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[27px] left-0 not-italic text-[#64992f] text-[18px] top-[0.5px] whitespace-nowrap">2</p>
    </div>
  );
}

function Container30() {
  return (
    <div className="mb-[-3px] relative shrink-0 w-[260px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center relative size-full">
        <Text2 />
        <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[18px] not-italic relative shrink-0 text-[#5a5a5a] text-[10px] whitespace-nowrap">phone charges saved in energy</p>
      </div>
    </div>
  );
}

function Container32() {
  return <div className="bg-[#7cbc3b] h-[4px] relative rounded-[16777200px] shrink-0 w-[104px]" data-name="Container" />;
}

function Container31() {
  return (
    <div className="bg-[#e8f4d4] content-stretch flex flex-col h-[4px] items-start overflow-clip relative rounded-[16777200px] shrink-0 w-full" data-name="Container">
      <Container32 />
    </div>
  );
}

function ContainerMargin3() {
  return (
    <div className="relative shrink-0 w-[260px]" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[4px] relative size-full">
        <Container31 />
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="h-full relative shrink-0" data-name="Container">
      <div className="flex flex-col justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-between py-[2px] relative size-full">
          <Container30 />
          <ContainerMargin3 />
        </div>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[36px] relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative size-full">
        <Container28 />
        <Container29 />
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="relative shrink-0 w-[310px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[10px] items-start relative size-full">
        <Container15 />
        <Container21 />
        <Container27 />
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="bg-white drop-shadow-[0px_4px_10px_rgba(0,0,0,0.07)] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start p-[16px] relative size-full">
        <Frame3 />
        <Container14 />
        <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16.5px] not-italic relative shrink-0 text-[#00c6ff] text-[11px] whitespace-nowrap">Keep recycling to grow your impact →</p>
      </div>
    </div>
  );
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p93fc9f0} id="Vector" stroke="var(--stroke-0, #64992F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p36e9fb40} id="Vector_2" stroke="var(--stroke-0, #64992F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container34() {
  return (
    <div className="bg-[#e8f4d4] relative rounded-[10px] shrink-0 size-[40px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon6 />
      </div>
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[18px] relative shrink-0 w-[85.555px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[18px] left-0 not-italic text-[#64992f] text-[12px] top-[0.5px] whitespace-nowrap">Did you know?</p>
      </div>
    </div>
  );
}

function Text4() {
  return (
    <div className="bg-[#e8f4d4] h-[17.5px] relative rounded-[4px] shrink-0 w-[80.313px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[13.5px] left-[6px] not-italic text-[#64992f] text-[9px] top-[2.5px] whitespace-nowrap">RECYCLING TIP</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative size-full">
        <Text3 />
        <Text4 />
      </div>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[18.6px] not-italic relative shrink-0 text-[#1b1b1b] text-[12px] w-[263px]">Rinsing containers before recycling prevents contamination — dirty waste can spoil an entire bin and send it to landfill instead.</p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">
        <Container36 />
        <Paragraph2 />
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="bg-white drop-shadow-[0px_2px_5px_rgba(0,0,0,0.05)] relative rounded-[16px] shrink-0 w-[350px]" data-name="Container">
      <div aria-hidden className="absolute border-[#e8f4d4] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-start p-[17.5px] relative size-full">
        <Container34 />
        <Container35 />
      </div>
    </div>
  );
}

function StudentHomeScreen() {
  return (
    <div className="relative shrink-0 w-full" data-name="StudentHomeScreen">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start relative size-full">
        <Top />
        <Container3 />
        <Button1 />
        <Container12 />
        <Container33 />
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[40px] px-[20px] relative shadow-[0px_40px_100px_0px_rgba(0,0,0,0.35),0px_0px_0px_1.5px_rgba(0,0,0,0.12)] size-full" data-name="Container">
      <div aria-hidden className="absolute bg-[#f6edd9] inset-0 pointer-events-none" />
      <StudentHomeScreen />
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_0px_1px_rgba(255,255,255,0.15)]" />
    </div>
  );
}
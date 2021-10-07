import Head from "next/head";
import Image from "next/image";
import { Client, ClientErrorCode } from "@notionhq/client";

export default function Home({ title, image, links }) {
  return (
    <div className="container">
      <Head>
        <title>LinkTree Clone</title>
        <meta name="description" content="LinkTree Clone" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Image alt="" src={image} className="avatar" width={75} height={75} />

      <h5>{title}</h5>
      {links.map((link) => (
        <a rel="noreferrer" target="_blank" key={link.name} href={link.url}>
          {link.name}
        </a>
      ))}
    </div>
  );
}

// This function will be called during the build time
// When we deplooy the application it will fetch the new list
// We will use ISR Incremental Static Regeneration
// We will get image, title and links
/*
By using notion page as the data source, 
I can leverage the features that notion app provides, such as: adding, removing and updating content, and even re-ordering the links. 
*/
export const getStaticProps = async () => {
  // Getting notion instance
  const notion = new Client({
    auth: process.env.NOTION_SECRET,
  });

  // Fetch the data
  const page_info = await notion.pages.retrieve({
    page_id: process.env.LINKS_PAGE_ID,
  });

  const blocks = await notion.blocks.children.list({
    block_id: process.env.LINKS_PAGE_ID,
  });

  const title = page_info.properties.title.title[0].plain_text;

  const links = [];
  let image = "";

  blocks.results.forEach((block) => {
    if (block.type === "image") image = block.image.external.url;
    if (block.type === "paragraph" && block.paragraph.text[0].plain_text !== "")
      links.push({
        name: block.paragraph.text[0].plain_text,
        url: block.paragraph.text[0].href,
      });
  });

  return {
    props: { title, image, links },
    revalidate: 10,
  };
};

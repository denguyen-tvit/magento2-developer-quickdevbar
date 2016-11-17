<?php

namespace ADM\QuickDevBar\Console\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Magento\Framework\Exception\LocalizedException;


class CatalogRule extends Command
{
    protected $_repository;
    protected $_searchBuilder;
    protected $_collectionFactory;
    protected $_state;

    public function __construct(
        \Magento\SalesRule\Api\RuleRepositoryInterface $ruleRepositoryInterface,
        \Magento\Framework\Api\SearchCriteriaBuilder $searchCriteriaBuilder,
        \Magento\CatalogRule\Model\ResourceModel\Rule\CollectionFactory $collectionFactory,
        \Magento\Framework\App\State $state,
        $name = null
    )
    {
        $this->_repository = $ruleRepositoryInterface;
        $this->_searchBuilder = $searchCriteriaBuilder;
        $this->_collectionFactory = $collectionFactory;
        $this->_state = $state;
        parent::__construct();
    }

    /**
     * {@inheritdoc}
     */
    protected function configure()
    {
        $this->setName('devbar:catalogrule:clear')
            ->setDescription('Clear all catalog rules');
        parent::configure();
    }

    /**
     * {@inheritdoc}
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        try {
            $this->_state->setAreaCode('frontend');
            /** @var \Magento\CatalogRule\Model\ResourceModel\Rule\Collection $collection */
            $collection = $this->_collectionFactory->create();
            /** @var \Magento\CatalogRule\Model\Rule $rule */
            foreach ($collection as $rule) {
                $rule->delete();
            }
            $ruleIds = implode(',', $collection->getAllIds());
            //$collection->walk('delete');
            $output->writeln("Catalog rules: {$ruleIds} was deleted");

        } catch (\Exception $e) {
            $output->writeln('<error>' . $e->getMessage() . '</error>');
            if ($output->getVerbosity() >= OutputInterface::VERBOSITY_VERBOSE) {
                $output->writeln($e->getTraceAsString());
            }
            return;
        }
    }
}